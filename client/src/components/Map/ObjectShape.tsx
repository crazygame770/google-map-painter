import { Rect, Group, Text } from 'react-konva';
import { BaseMapObject } from '@/lib/objects';

interface ObjectShapeProps {
  object: BaseMapObject;
  x: number;
  y: number;
  rotation?: number;
}

const PIXELS_PER_METER = 10; // 1 meter = 10 pixels at zoom level 1

const objectStyles = {
  // Vehicles
  truck: {
    fill: '#4A5568',
    stroke: '#2D3748',
    cornerRadius: 5,
  },
  car: {
    fill: '#4299E1',
    stroke: '#2B6CB0',
    cornerRadius: 8,
  },
  rv: {
    fill: '#48BB78',
    stroke: '#2F855A',
    cornerRadius: 5,
  },
  // Facilities
  'porta-potty': {
    fill: '#9F7AEA',
    stroke: '#6B46C1',
    cornerRadius: 2,
  },
  'double-banger': {
    fill: '#9F7AEA',
    stroke: '#6B46C1',
    cornerRadius: 2,
  },
  'triple-banger': {
    fill: '#9F7AEA',
    stroke: '#6B46C1',
    cornerRadius: 2,
  },
  'makeup-trailer': {
    fill: '#F687B3',
    stroke: '#B83280',
    cornerRadius: 3,
  },
  'costumes-trailer': {
    fill: '#F687B3',
    stroke: '#B83280',
    cornerRadius: 3,
  },
  // Miscellaneous
  tent: {
    fill: '#F6AD55',
    stroke: '#C05621',
    cornerRadius: 0,
  },
  table: {
    fill: '#CBD5E0',
    stroke: '#718096',
    cornerRadius: 2,
  },
  chair: {
    fill: '#A0AEC0',
    stroke: '#4A5568',
    cornerRadius: 10,
  },
};

export function ObjectShape({ object, x, y, rotation = 0 }: ObjectShapeProps) {
  const style = objectStyles[object.id as keyof typeof objectStyles];
  const width = object.width * PIXELS_PER_METER;
  const length = object.length * PIXELS_PER_METER;

  return (
    <Group x={x} y={y} rotation={rotation}>
      <Rect
        width={width}
        height={length}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={2}
        cornerRadius={style.cornerRadius}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      <Text
        text={object.name}
        fontSize={12}
        fill="white"
        align="center"
        width={width}
        y={length + 5}
      />
    </Group>
  );
}
