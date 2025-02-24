import { Line } from 'react-konva';

interface GridOverlayProps {
  width: number;
  height: number;
  scale: number;
}

export function GridOverlay({ width, height, scale }: GridOverlayProps) {
  const GRID_SIZE = 256; // Match Google Maps tile size
  const lines = [];

  // Calculate grid lines based on world coordinates
  const startX = Math.floor(-width / scale / GRID_SIZE) * GRID_SIZE;
  const endX = Math.ceil(width / scale / GRID_SIZE) * GRID_SIZE;
  const startY = Math.floor(-height / scale / GRID_SIZE) * GRID_SIZE;
  const endY = Math.ceil(height / scale / GRID_SIZE) * GRID_SIZE;

  // Vertical lines
  for (let x = startX; x <= endX; x += GRID_SIZE) {
    lines.push(
      <Line
        key={`v${x}`}
        points={[x, startY, x, endY]}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth={1 / scale}
      />
    );
  }

  // Horizontal lines
  for (let y = startY; y <= endY; y += GRID_SIZE) {
    lines.push(
      <Line
        key={`h${y}`}
        points={[startX, y, endX, y]}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth={1 / scale}
      />
    );
  }

  return <>{lines}</>;
}
