import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const canvasObjects = pgTable("canvas_objects", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'truck', 'tent', etc
  data: jsonb("data").notNull(), // position, rotation, etc
  properties: jsonb("properties").notNull() // size, color, etc
});

export const insertCanvasObjectSchema = createInsertSchema(canvasObjects).pick({
  type: true,
  data: true,
  properties: true
});

export type InsertCanvasObject = z.infer<typeof insertCanvasObjectSchema>;
export type CanvasObject = typeof canvasObjects.$inferSelect;
