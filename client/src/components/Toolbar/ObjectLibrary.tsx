import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { objects } from "@/lib/objects";

export function ObjectLibrary() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Objects</h2>
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-2 gap-2">
          {objects.map((object) => (
            <Button
              key={object.id}
              variant="outline"
              className="flex flex-col items-center p-4"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('object', JSON.stringify(object));
              }}
            >
              <object.icon className="h-6 w-6 mb-1" />
              <span className="text-xs">{object.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
