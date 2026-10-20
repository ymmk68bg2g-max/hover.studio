import assert from "node:assert/strict";
import test from "node:test";
import { placeMobileTechnologyLabels, placeTabletPortraitTechnologyLabels, placeTechnologyLabels, rectanglesIntersect, revealEnvelope } from "../app/hero-technology-layout.ts";

const labelRect = (label, point) => ({
  left: point.x - label.width / 2, right: point.x + label.width / 2,
  top: point.y - label.height / 2, bottom: point.y + label.height / 2,
});

test("portrait tablet adds two staggered outer rows while preserving the inner field", () => {
  const bounds = { left: 12, right: 701, top: 12, bottom: 560 };
  const inner = { ...bounds, top: 108, bottom: 464 };
  const obstacles = [
    { left: -20, right: 400, top: 176, bottom: 306 },
    { left: 260, right: 480, top: 256, bottom: 386 },
    { left: 380, right: 740, top: 336, bottom: 456 },
  ];
  const core = [80, 96, 48, 72, 120, 40].map(width => ({ width, height: 13 }));
  const labels = [...core, ...["top", "bottom"].flatMap(band => [48, 40, 64, 80, 104, 116].map(width => ({ width, height: 13, band })))];
  const points = placeTabletPortraitTechnologyLabels(bounds, inner, obstacles, labels, 20);
  assert.deepEqual(points.slice(0, core.length), placeTechnologyLabels(inner, obstacles, core, 20));
  assert.deepEqual(points, placeTabletPortraitTechnologyLabels(bounds, inner, obstacles, labels, 20));
  const occupied = [];
  points.forEach((point, index) => {
    assert.ok(point);
    const rect = labelRect(labels[index], point);
    assert.ok(rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom);
    assert.ok(obstacles.every(other => !rectanglesIntersect(rect, other)));
    assert.ok(occupied.every(other => !rectanglesIntersect(rect, other)));
    occupied.push({ left: rect.left - 20, right: rect.right + 20, top: rect.top - 20, bottom: rect.bottom + 20 });
    if (labels[index].band === "top") assert.ok(rect.bottom < inner.top);
    if (labels[index].band === "bottom") assert.ok(rect.top > inner.bottom);
  });
  for (const zone of ["top", "bottom"]) {
    const row = points.filter(point => point.zone === zone);
    assert.equal(row.length, 6);
    assert.equal(new Set(row.map(point => point.y)).size, 6);
  }
});

const mobileNames = ["HTML", "CSS", "React", "TypeScript", "JavaScript", "SVG", "Grid", "Flexbox", "API", "UI", "UX", "SEO", "Motion", "Forms", "Next.js", "Vite", "Tailwind CSS", "Responsive", "Components", "Routing", "Web Fonts", "Accessibility", "Performance", "Tokens", "CMS"];
const mobileLabels = mobileNames.map(name => ({
  width: name.length * 6.711, height: 11,
  ...(name === "CMS" ? { side: "left" } : name === "Tokens" ? { side: "right" } : {}),
}));

test("mobile uses two balanced staggered rows per band and three short words on either side", () => {
  const bounds = { left: 8, right: 331.8125, top: 173.27, bottom: 563.64 };
  const obstacles = [
    { left: -12, right: 265, top: 236.8, bottom: 380.4 },
    { left: 81.7, right: 225, top: 295.5, bottom: 439.1 },
    { left: 47, right: 364, top: 353.3, bottom: 489.3 },
  ];
  const placements = placeMobileTechnologyLabels(bounds, obstacles, mobileLabels, 12);
  assert.ok(placements.every(Boolean));
  assert.deepEqual(placements, placeMobileTechnologyLabels(bounds, obstacles, mobileLabels, 12));
  for (const zone of ["left", "right"]) {
    const side = placements.map((point, index) => ({ point, index })).filter(({ point }) => point.zone === zone);
    assert.equal(side.length, 3);
    assert.ok(side.every(({ index }) => mobileLabels[index].width <= 48));
  }
  assert.equal(placements[mobileNames.indexOf("CMS")].zone, "left");
  assert.equal(placements[mobileNames.indexOf("Tokens")].zone, "right");
  const footprint = [];
  for (const zone of ["top", "bottom"]) {
    const band = placements.filter(point => point.zone === zone);
    assert.deepEqual([...new Set(band.map(point => point.row))].sort(), [0, 1]);
    for (const row of [0, 1]) {
      const points = band.filter(point => point.row === row);
      assert.ok(points.length >= 4);
      assert.ok(new Set(points.map(point => point.y)).size >= 3, "row baselines stay loose");
    }
    footprint.push(Math.max(...band.map(point => point.y)) - Math.min(...band.map(point => point.y)));
  }
  assert.ok(Math.abs(footprint[0] - footprint[1]) <= 5, "upper and lower bands occupy comparable height");
});

test("mobile boxes stay clear of text, neighbours and field edges at narrow and wide widths", () => {
  for (const width of [285, 340, 395, 725]) {
    const bounds = { left: 8, top: 110, right: width - 8, bottom: 570 };
    const obstacles = [
      { left: -12, right: width * 0.78, top: 180, bottom: 310 },
      { left: width * 0.28, right: width * 0.65, top: 245, bottom: 375 },
      { left: width * 0.18, right: width + 12, top: 310, bottom: 440 },
    ];
    const labels = width < 300 ? mobileLabels.map((label, index) => index >= 14 && index < 23 ? { width: 0, height: 0 } : label) : mobileLabels;
    const placements = placeMobileTechnologyLabels(bounds, obstacles, labels, 12);
    const occupied = [];
    placements.forEach((point, index) => {
      if (!point) return;
      const rect = labelRect(labels[index], point);
      assert.ok(rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom);
      assert.ok(obstacles.every(obstacle => !rectanglesIntersect(rect, obstacle)));
      assert.ok(occupied.every(other => !rectanglesIntersect(rect, other)));
      occupied.push({ left: rect.left - 12, right: rect.right + 12, top: rect.top - 12, bottom: rect.bottom + 12 });
      if (point.zone === "top" || point.zone === "bottom") assert.ok(point.row === 0 || point.row === 1);
    });
    assert.ok(occupied.length >= 10);
    if (width < 300) assert.ok(placements.slice(14, 23).every(point => point === null));
  }
  const bounds = { left: 0, top: 0, right: 80, bottom: 40 };
  assert.deepEqual(placeMobileTechnologyLabels(bounds, [bounds], [{ width: 40, height: 11 }], 12), [null]);
});

test("mobile reserves longer connector words and extends staggered rows to the content edges", () => {
  const bounds = { left: 0, right: 340, top: 170, bottom: 565 };
  const connector = { left: 82, right: 225, top: 300, bottom: 412 };
  const obstacles = [
    { left: -12, right: 250, top: 240, bottom: 330 },
    { left: 240, right: 268, top: 310, bottom: 345 },
    connector,
    { left: 47, right: 364, top: 372, bottom: 462 },
  ];
  const labels = [...mobileLabels, { width: 60, height: 11, middleSide: "left" }, { width: 74, height: 11, middleSide: "right" }];
  const points = placeMobileTechnologyLabels(bounds, obstacles, labels, 12, connector);
  for (const [index, side] of [[25, "left"], [26, "right"]]) {
    assert.ok(points[index]);
    assert.equal(points[index].zone, side);
    const rect = labelRect(labels[index], points[index]);
    assert.ok(side === "left" ? rect.right <= connector.left : rect.left >= connector.right);
    assert.ok(rect.top >= connector.top && rect.bottom <= connector.bottom);
  }
  const occupied = [];
  points.forEach((point, index) => {
    if (!point) return;
    const rect = labelRect(labels[index], point);
    assert.ok(obstacles.every(other => !rectanglesIntersect(rect, other)));
    assert.ok(occupied.every(other => !rectanglesIntersect(rect, other)));
    occupied.push({ left: rect.left - 12, right: rect.right + 12, top: rect.top - 12, bottom: rect.bottom + 12 });
  });
  const edges = [];
  for (const zone of ["top", "bottom"]) for (const row of [0, 1]) {
    const rects = points.flatMap((point, index) => point?.zone === zone && point.row === row ? [labelRect(labels[index], point)] : []);
    const left = Math.min(...rects.map(rect => rect.left)), right = Math.max(...rects.map(rect => rect.right));
    assert.ok(left <= 6 && right >= 334, "each row reaches both content edges");
    edges.push(left);
  }
  assert.notEqual(edges[0], edges[1], "alternating rows retain different edge offsets");
});

test("keeps label positions stable throughout the heading and boundary reveal", () => {
  const finalHeading = { left: 70, top: 100, right: 390, bottom: 190 };
  const finalMeta = { left: 0, top: 0, right: 800, bottom: 20 };
  const finalBottom = { left: 0, top: 370, right: 800, bottom: 400 };
  const shifted = (rect, y) => ({ ...rect, top: rect.top + y, bottom: rect.bottom + y });
  const labels = Array.from({ length: 16 }, () => ({ width: 60, height: 16 }));
  let expected;
  for (const y of [21.6, 8, 0]) {
    const heading = revealEnvelope(shifted(finalHeading, y), 0, y, 21.6);
    const meta = revealEnvelope(shifted(finalMeta, y), 0, y, 21.6);
    const bottom = revealEnvelope(shifted(finalBottom, y), 0, y, 21.6);
    const positions = placeTechnologyLabels({ left: 0, top: meta.bottom + 20, right: 800, bottom: bottom.top - 20 }, [heading], labels, 16);
    if (expected) assert.deepEqual(positions, expected);
    else expected = positions;
  }
});

test("moves an entire label outside a solid heading box, including its glyph holes", () => {
  const bounds = { left: 0, top: 0, right: 600, bottom: 300 };
  const obstacle = { left: 30, top: 50, right: 350, bottom: 180 };
  const labels = [{ width: 110, height: 18, x: 180, y: 100 }];
  const [placed] = placeTechnologyLabels(bounds, [obstacle], labels, 10);
  assert.ok(placed);
  assert.equal(rectanglesIntersect(labelRect(labels[0], placed), obstacle), false);
});

test("spreads labels throughout free space instead of clustering around their old anchors", () => {
  const bounds = { left: 0, top: 0, right: 800, bottom: 400 };
  const labels = Array.from({ length: 16 }, () => ({ width: 60, height: 16, x: 40, y: 40 }));
  const points = placeTechnologyLabels(bounds, [], labels, 16);
  assert.ok(points.every(Boolean));
  const quadrants = [0, 0, 0, 0];
  points.forEach(point => quadrants[(point.x >= 400 ? 1 : 0) + (point.y >= 200 ? 2 : 0)]++);
  assert.ok(quadrants.every(count => count >= 2), `quadrant counts: ${quadrants}`);
  for (let y = 10; y <= 390; y += 20) {
    for (let x = 30; x <= 770; x += 20) {
      assert.ok(Math.min(...points.map(point => Math.hypot(point.x - x, point.y - y))) < 180, `unfilled area around ${x},${y}`);
    }
  }
});

test("fills each separated free region, including regions far from the old anchors", () => {
  const bounds = { left: 0, top: 0, right: 1000, bottom: 400 };
  const obstacles = [
    { left: 300, top: 0, right: 360, bottom: 400 },
    { left: 650, top: 0, right: 710, bottom: 400 },
  ];
  const labels = Array.from({ length: 12 }, () => ({ width: 60, height: 16, x: 100, y: 100 }));
  const points = placeTechnologyLabels(bounds, obstacles, labels, 16);
  const counts = [points.filter(point => point && point.x < 300).length, points.filter(point => point && point.x > 360 && point.x < 650).length, points.filter(point => point && point.x > 710).length];
  assert.ok(counts.every(count => count >= 2), `region counts: ${counts}`);
});

test("hides words when no safe area is available and skips CSS-hidden words", () => {
  const bounds = { left: 0, top: 0, right: 100, bottom: 60 };
  assert.deepEqual(placeTechnologyLabels(bounds, [bounds], [{ width: 40, height: 16, x: 50, y: 30 }], 8), [null]);
  assert.deepEqual(placeTechnologyLabels(bounds, [], [{ width: 0, height: 0, x: NaN, y: NaN }], 8), [null]);
  assert.deepEqual(placeTechnologyLabels(bounds, [], [{ width: 120, height: 16, x: 50, y: 30 }], 8), [null]);
});

test("placement is deterministic, contained and collision-free across narrow and wide fields", () => {
  for (const width of [320, 360, 390, 430, 768, 1024, 1440, 1920]) {
    for (const locale of ["ua", "en"]) {
      const height = width <= 430 ? 240 : 420;
      const bounds = { left: 4, top: 4, right: width - 4, bottom: height - 4 };
      const gap = width <= 430 ? 8 : 10;
      // Distinct line lengths model the two language compositions.
      const obstacles = [
        { left: 0, top: 60, right: width * (locale === "ua" ? 0.42 : 0.38), bottom: 105 },
        { left: width * 0.4, top: 115, right: width * 0.6, bottom: 160 },
        { left: width * (locale === "ua" ? 0.58 : 0.5), top: 175, right: width, bottom: 220 },
      ];
      const labels = Array.from({ length: width <= 430 ? 14 : 32 }, (_, i) => ({
        width: 28 + i % 4 * 16, height: width <= 430 ? 11 : 18,
        x: (i * 67 % (width - 20)) + 10, y: (i * 31 % (height - 20)) + 10,
      }));
      const placements = placeTechnologyLabels(bounds, obstacles, labels, gap);
      assert.deepEqual(placements, placeTechnologyLabels(bounds, obstacles, labels, gap));
      const occupied = [];
      placements.forEach((point, i) => {
        if (!point) return;
        const rect = labelRect(labels[i], point);
        assert.ok(rect.left >= bounds.left - 0.001 && rect.right <= bounds.right + 0.001);
        assert.ok(rect.top >= bounds.top - 0.001 && rect.bottom <= bounds.bottom + 0.001);
        assert.ok(obstacles.every(obstacle => !rectanglesIntersect(rect, obstacle)));
        assert.ok(occupied.every(previous => !rectanglesIntersect(rect, previous)));
        occupied.push({ left: rect.left - gap, right: rect.right + gap, top: rect.top - gap, bottom: rect.bottom + gap });
      });
      assert.ok(occupied.length > 0, `${locale} ${width}: some decorative words fit`);
    }
  }
});
