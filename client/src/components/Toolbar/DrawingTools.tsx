import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Square,
  Circle,
  ArrowRight,
  Pencil,
  Type
} from "lucide-react";

export function DrawingTools() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Drawing Tools</h2>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="flex flex-col items-center p-4">
          <Square className="h-6 w-6 mb-1" />
          <span className="text-xs">Rectangle</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center p-4">
          <Circle className="h-6 w-6 mb-1" />
          <span className="text-xs">Circle</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center p-4">
          <ArrowRight className="h-6 w-6 mb-1" />
          <span className="text-xs">Arrow</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center p-4">
          <Pencil className="h-6 w-6 mb-1" />
          <span className="text-xs">Free Draw</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center p-4">
          <Type className="h-6 w-6 mb-1" />
          <span className="text-xs">Text</span>
        </Button>
      </div>
      <Separator />
    </div>
  );
}
