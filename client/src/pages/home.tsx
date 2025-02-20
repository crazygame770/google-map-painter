import { MapCanvas } from "@/components/Map/MapCanvas";
import { DrawingTools } from "@/components/Toolbar/DrawingTools";
import { ObjectLibrary } from "@/components/Toolbar/ObjectLibrary";

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-64 border-r border-border bg-sidebar p-4">
        <h1 className="text-xl font-bold mb-4">BaseMapper</h1>
        <DrawingTools />
        <ObjectLibrary />
      </div>
      <div className="flex-1 relative">
        <MapCanvas />
      </div>
    </div>
  );
}
