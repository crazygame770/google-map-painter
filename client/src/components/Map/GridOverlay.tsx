import { Line } from 'react-konva';

interface GridOverlayProps {
  width: number;
  height: number;
  scale: number;
}

export function GridOverlay({ width, height, scale }: GridOverlayProps) {
  const GRID_SIZE = 10; // 10 meters
  const gridSpacing = 50; // pixels per grid unit at scale 1

  const createGridLines = () => {
    const lines = [];
    const scaledSpacing = gridSpacing * scale;
    
    // Vertical lines
    for (let x = 0; x < width; x += scaledSpacing) {
      lines.push(
        <Line
          key={`v${x}`}
          points={[x, 0, x, height]}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={1}
          dash={[5, 5]}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y < height; y += scaledSpacing) {
      lines.push(
        <Line
          key={`h${y}`}
          points={[0, y, width, y]}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={1}
          dash={[5, 5]}
        />
      );
    }

    return lines;
  };

  return <>{createGridLines()}</>;
}
