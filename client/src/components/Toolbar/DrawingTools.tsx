import { Button } from "@/components/ui/button";
import {
  Square,
  Circle,
  ArrowRight,
  Pencil,
  Type,
  MousePointer
} from "lucide-react";

export function DrawingTools() {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg p-2 flex gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Select">
          <MousePointer className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Rectangle">
          <Square className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Circle">
          <Circle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Arrow">
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Free Draw">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Text">
          <Type className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}