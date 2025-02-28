import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { objects, categories } from "@/lib/objects";

export function ObjectLibrary() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Objects</h2>
      <ScrollArea className="h-[calc(100vh-300px)]">
        <Accordion type="multiple" className="w-full">
          {categories.map((category) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-sm py-3">{category}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-3 p-3">
                  {objects
                    .filter((object) => object.category === category)
                    .map((object) => (
                      <Button
                        key={object.id}
                        variant="outline"
                        className="flex flex-col items-center p-4 space-y-2 h-auto min-h-[100px]"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("object", JSON.stringify(object));
                        }}
                      >
                        <object.icon className="h-6 w-6 mb-1" />
                        <span className="text-xs text-center">{object.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {object.width}m × {object.length}m
                        </span>
                      </Button>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}