export type FieldRect = { left: number; top: number; right: number; bottom: number };
export type FieldLabel = { width: number; height: number; side?: "left" | "right"; middleSide?: "left" | "right"; band?: "top" | "bottom" };
export type LabelPlacement = { x: number; y: number; zone?: "top" | "bottom" | "left" | "right"; row?: number } | null;

// Reserve the same final box and full reveal path at every animation frame.
export function revealEnvelope(rect: FieldRect, translateX: number, translateY: number, travelY: number): FieldRect {
  return {
    left: rect.left - translateX,
    right: rect.right - translateX,
    top: rect.top - translateY,
    bottom: rect.bottom - translateY + travelY,
  };
}

export function rectanglesIntersect(a: FieldRect, b: FieldRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function squaredDistanceToRect(x: number, y: number, rect: FieldRect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return dx * dx + dy * dy;
}

// Fill the whole free field, rather than clustering around preset anchors.
// Whole label boxes remain outside the heading; glyph holes are not targets.
export function placeTechnologyLabels(
  bounds: FieldRect,
  obstacles: FieldRect[],
  labels: FieldLabel[],
  gap: number,
): LabelPlacement[] {
  const placements: LabelPlacement[] = labels.map(() => null);
  const occupied: FieldRect[] = [];
  const step = Math.max(12, Math.min(24, (bounds.right - bounds.left) / 70));
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;
  // Reserve roomy positions for longer words before fitting shorter labels.
  const order = labels.map((label, index) => ({ ...label, index })).sort((a, b) => b.width - a.width || a.index - b.index);

  for (const { width, height, index } of order) {
    if (width <= 0 || height <= 0) continue;
    const minX = bounds.left + width / 2;
    const maxX = bounds.right - width / 2;
    const minY = bounds.top + height / 2;
    const maxY = bounds.bottom - height / 2;
    if (maxX < minX || maxY < minY) continue;

    const best: { point: LabelPlacement; score: number; clearance: number; centerDistance: number } = { point: null, score: -Infinity, clearance: -Infinity, centerDistance: Infinity };
    const consider = (cx: number, cy: number) => {
      const rect = { left: cx - width / 2, right: cx + width / 2, top: cy - height / 2, bottom: cy + height / 2 };
      const edgeDistance = Math.min(cx - bounds.left, bounds.right - cx, cy - bounds.top, bounds.bottom - cy);
      let clearance = edgeDistance * edgeDistance;
      for (const obstacle of obstacles) {
        if (rectanglesIntersect(rect, obstacle)) return;
        clearance = Math.min(clearance, squaredDistanceToRect(cx, cy, obstacle));
      }
      let score = occupied.length ? Infinity : clearance;
      for (const other of occupied) {
        if (rectanglesIntersect(rect, other)) return;
        score = Math.min(score, squaredDistanceToRect(cx, cy, other));
      }
      const centerDistance = (cx - centerX) ** 2 + (cy - centerY) ** 2;
      if (score < best.score || (score === best.score && (clearance < best.clearance || (clearance === best.clearance && centerDistance >= best.centerDistance)))) return;
      best.point = { x: cx, y: cy };
      best.score = score;
      best.clearance = clearance;
      best.centerDistance = centerDistance;
    };

    let row = 0;
    for (let cy = minY; cy <= maxY; cy += step) {
      // Stagger rows so the word field stays loose instead of forming columns.
      for (let cx = minX + (row % 2) * step / 2; cx <= maxX; cx += step) consider(cx, cy);
      consider(minX, cy);
      consider(maxX, cy);
      row++;
    }
    for (let cx = minX; cx <= maxX; cx += step) consider(cx, maxY);
    consider(maxX, maxY);

    if (best.point) {
      placements[index] = best.point;
      occupied.push({
        left: best.point.x - width / 2 - gap,
        right: best.point.x + width / 2 + gap,
        top: best.point.y - height / 2 - gap,
        bottom: best.point.y + height / 2 + gap,
      });
    }
  }
  return placements;
}

// Add an outer row on either side of the original field on portrait tablets.
export function placeTabletPortraitTechnologyLabels(
  bounds: FieldRect,
  innerBounds: FieldRect,
  obstacles: FieldRect[],
  labels: FieldLabel[],
  gap: number,
): LabelPlacement[] {
  const placements = placeTechnologyLabels(innerBounds, obstacles, labels.map(label => label.band ? { ...label, width: 0, height: 0 } : label), gap);
  const occupied = placements.flatMap((point, index) => point ? [{
    left: point.x - labels[index].width / 2 - gap,
    right: point.x + labels[index].width / 2 + gap,
    top: point.y - labels[index].height / 2 - gap,
    bottom: point.y + labels[index].height / 2 + gap,
  }] : []);
  const offsets = [-6, 5, -3, 6, -5, 3];
  for (const band of ["top", "bottom"] as const) {
    const row = labels.map((label, index) => ({ ...label, index })).filter(label => label.band === band && label.width > 0 && label.height > 0);
    if (!row.length) continue;
    const inset = band === "bottom" ? 12 : 0;
    const available = bounds.right - bounds.left - inset;
    const totalWidth = row.reduce((sum, label) => sum + label.width, 0);
    const spacing = row.length > 1 ? (available - totalWidth) / (row.length - 1) : 0;
    if (spacing < gap) continue;
    const centerY = band === "top" ? (bounds.top + innerBounds.top) / 2 : (bounds.bottom + innerBounds.bottom) / 2;
    let cursor = bounds.left + inset;
    for (const [slot, label] of row.entries()) {
      const point = { x: cursor + label.width / 2, y: centerY + offsets[(slot + (band === "bottom" ? 3 : 0)) % offsets.length], zone: band, row: 0 };
      const rect = { left: point.x - label.width / 2, right: point.x + label.width / 2, top: point.y - label.height / 2, bottom: point.y + label.height / 2 };
      if (rect.top >= bounds.top && rect.bottom <= bounds.bottom && ![...obstacles, ...occupied].some(other => rectanglesIntersect(rect, other))) {
        placements[label.index] = point;
      }
      cursor += label.width + spacing;
    }
  }
  return placements;
}

// Keep the mobile composition balanced: two loose rows per band and short side labels.
export function placeMobileTechnologyLabels(
  bounds: FieldRect,
  obstacles: FieldRect[],
  labels: FieldLabel[],
  gap: number,
  connector?: FieldRect,
): LabelPlacement[] {
  if (!obstacles.length) return placeTechnologyLabels(bounds, obstacles, labels, gap);
  const placements: LabelPlacement[] = labels.map(() => null);
  const occupied: FieldRect[] = [];
  const visible = labels.map((label, index) => ({ ...label, index })).filter(label => label.width > 0 && label.height > 0);
  const headingTop = Math.min(...obstacles.map(rect => rect.top));
  const headingBottom = Math.max(...obstacles.map(rect => rect.bottom));
  const width = bounds.right - bounds.left;
  const commit = (index: number, point: NonNullable<LabelPlacement>) => {
    const { width, height } = labels[index];
    const rect = { left: point.x - width / 2, right: point.x + width / 2, top: point.y - height / 2, bottom: point.y + height / 2 };
    if (rect.left < bounds.left || rect.right > bounds.right || rect.top < bounds.top || rect.bottom > bounds.bottom) return false;
    if ([...obstacles, ...occupied].some(other => rectanglesIntersect(rect, other))) return false;
    placements[index] = point;
    occupied.push({ left: rect.left - gap, right: rect.right + gap, top: rect.top - gap, bottom: rect.bottom + gap });
    return true;
  };
  const sideCounts = { left: 0, right: 0 };
  const middlePlaced = { left: false, right: false };
  const placeSide = (index: number, side: "left" | "right", middle = false) => {
    const sideBounds = {
      left: side === "left" ? bounds.left : middle && connector ? connector.right : bounds.left + width * 0.66,
      right: side === "left" ? middle && connector ? connector.left : bounds.left + width * 0.34 : bounds.right,
      top: Math.max(bounds.top, middle && connector ? connector.top : headingTop),
      bottom: Math.min(bounds.bottom, middle && connector ? connector.bottom : headingBottom),
    };
    const [point] = placeTechnologyLabels(sideBounds, [...obstacles, ...occupied], [labels[index]], gap);
    if (!point) return false;
    const offset = middle ? side === "left" ? -6 : 10 : 0;
    for (let travel = Math.abs(offset); travel >= 0; travel--) {
      const y = point.y + Math.sign(offset) * travel;
      if (y - labels[index].height / 2 < sideBounds.top || y + labels[index].height / 2 > sideBounds.bottom) continue;
      if (!commit(index, { ...point, y, zone: side })) continue;
      sideCounts[side]++;
      return true;
    }
    return false;
  };
  // Reserve the two connector pockets before filling them with shorter labels.
  for (const label of visible) {
    if (label.middleSide && connector) middlePlaced[label.middleSide] = placeSide(label.index, label.middleSide, true);
  }
  for (const label of visible) {
    if (label.side) placeSide(label.index, label.side);
  }
  const shortLabels = visible.filter(label => !label.side && !label.middleSide && label.width <= 48).sort((a, b) => a.width - b.width || a.index - b.index);
  for (let slot = 0; slot < 4; slot++) {
    for (const side of ["left", "right"] as const) {
      if (sideCounts[side] >= (middlePlaced[side] ? 4 : 3)) continue;
      for (const label of shortLabels) {
        if (!placements[label.index] && placeSide(label.index, side)) break;
      }
    }
  }

  const maxHeight = Math.max(0, ...visible.map(label => label.height));
  const bands = [
    { zone: "top" as const, top: bounds.top, bottom: Math.min(bounds.bottom, headingTop) },
    { zone: "bottom" as const, top: Math.max(bounds.top, headingBottom), bottom: bounds.bottom },
  ].filter(band => band.bottom - band.top >= maxHeight);
  const minBandHeight = Math.min(...bands.map(band => band.bottom - band.top));
  const jitter = Math.min(5, Math.max(0, (minBandHeight - maxHeight * 2 - gap) / 4));
  const spread = Math.max(0, Math.min(48, ...bands.map(band => band.bottom - band.top - maxHeight - jitter * 2)));
  const rows = bands.flatMap(band => [0, 1].map(row => ({
    ...band, row, y: (band.top + band.bottom) / 2 + (row ? 1 : -1) * spread / 2,
    indices: [] as number[], load: 0,
  })));
  const horizontalJitter = 2;
  const rowGap = gap + horizontalJitter * 2;
  const edgeStagger = 6;
  const capacity = width - edgeStagger;
  // Share long words across all four rows before fitting the shorter ones.
  const remaining = visible.filter(label => !placements[label.index]).sort((a, b) => b.width - a.width || a.index - b.index);
  for (const label of remaining) {
    const available = rows.filter(row => row.load + (row.indices.length ? rowGap : 0) + label.width <= capacity);
    available.sort((a, b) => a.load - b.load || a.indices.length - b.indices.length || (a.zone === b.zone ? a.row - b.row : a.zone === "top" ? -1 : 1));
    const target = available[0];
    if (!target) continue;
    target.load += (target.indices.length ? rowGap : 0) + label.width;
    target.indices.push(label.index);
  }
  const offsets = [5, -3, 2, -5, 4];
  for (const row of rows) {
    // Stable shuffling and small offsets avoid repeated columns and flat baselines.
    row.indices.sort((a, b) => ((a * 17 + row.row * 11) % 29) - ((b * 17 + row.row * 11) % 29));
    const leadingInset = (row.row + (row.zone === "bottom" ? 1 : 0)) % 2 ? edgeStagger : 0;
    const spare = Math.max(0, capacity - row.load);
    const weights = row.indices.slice(1).map((_, slot) => 0.8 + ((slot * 7 + row.row * 3 + (row.zone === "bottom" ? 2 : 0)) % 5) * 0.1);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let cursor = bounds.left + leadingInset + (row.indices.length === 1 ? spare / 2 : 0);
    for (const [slot, index] of row.indices.entries()) {
      const label = labels[index];
      const phase = offsets[(slot + row.row * 2 + (row.zone === "bottom" ? 1 : 0)) % offsets.length] / 5;
      const offset = phase * jitter;
      const end = slot === 0 || slot === row.indices.length - 1;
      const x = Math.max(bounds.left + label.width / 2, Math.min(bounds.right - label.width / 2,
        cursor + label.width / 2 + (end ? 0 : phase * horizontalJitter * (row.row ? -1 : 1))));
      const preferredY = row.y + offset;
      for (const y of [preferredY, row.y, row.y - offset]) {
        if (y - label.height / 2 < row.top || y + label.height / 2 > row.bottom) continue;
        if (commit(index, { x, y, zone: row.zone, row: row.row })) break;
      }
      cursor += label.width + rowGap + (totalWeight ? spare * (weights[slot] ?? 0) / totalWeight : 0);
    }
  }
  return placements;
}
