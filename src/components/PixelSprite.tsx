import { useEffect, useRef } from "react";
import { drawSprite, type Palette, type SpriteGrid } from "../game/sprites";

export function PixelSprite({
  grid,
  palette,
  scale = 4,
  className,
}: {
  grid: SpriteGrid;
  palette: Palette;
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) drawSprite(ref.current, grid, palette, scale);
  }, [grid, palette, scale]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
