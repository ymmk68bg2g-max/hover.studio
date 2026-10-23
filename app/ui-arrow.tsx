type ArrowDirection = "up-right" | "down-right" | "right" | "left" | "up" | "down";

const arrowPaths: Record<ArrowDirection, string> = {
  "up-right": "M3.25 12.75 12.75 3.25M6 3.25h6.75V10",
  "down-right": "M3.25 3.25 12.75 12.75M6 12.75h6.75V6",
  right: "M2.5 8h10.25m-4-4L12.75 8l-4 4",
  left: "M13.5 8H3.25m4-4L3.25 8l4 4",
  up: "M8 13.5V3.25m-4 4L8 3.25l4 4",
  down: "M8 2.5v10.25m-4-4L8 12.75l4-4",
};

export function UiArrow({ direction = "up-right", className = "" }: { direction?: ArrowDirection; className?: string }) {
  return (
    <span className={`ui-arrow${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg viewBox="0 0 16 16" focusable="false"><path d={arrowPaths[direction]} /></svg>
    </span>
  );
}
