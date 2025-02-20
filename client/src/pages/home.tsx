import { MapCanvas } from "@/components/Map/MapCanvas";
import { DrawingTools } from "@/components/Toolbar/DrawingTools";
import { ObjectLibrary } from "@/components/Toolbar/ObjectLibrary";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left sidebar */}
      <div className={cn(
        "w-64 border-r border-border bg-sidebar p-4",
        "transition-transform duration-200 ease-in-out"
      )}>
        <h1 className="text-xl font-bold mb-4">BaseMapper</h1>
        <ObjectLibrary />
      </div>

      {/* Main canvas area */}
      <div className="flex-1 relative">
        <DrawingTools />
        <MapCanvas />
      </div>
    </div>
  );
}