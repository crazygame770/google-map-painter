import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCw } from "lucide-react";

interface MapControlsProps {
  scale: number;
  setScale: (scale: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
}

export function MapControls({
  scale,
  setScale,
  rotation,
  setRotation
}: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex gap-4 bg-background/80 p-2 rounded-lg backdrop-blur">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale(scale / 1.1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale(scale * 1.1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setRotation((rotation + 90) % 360)}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Slider
          className="w-32"
          min={0}
          max={360}
          step={1}
          value={[rotation]}
          onValueChange={([value]) => setRotation(value)}
        />
      </div>
    </div>
  );
}
