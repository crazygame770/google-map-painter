import { Truck, Car, Tent, Table, Armchair, Warehouse } from "lucide-react";

export interface BaseMapObject {
  id: string;
  name: string;
  icon: any; // LucideIcon
  width: number;  // meters
  length: number; // meters
  category: string;
}

export const objects: BaseMapObject[] = [
  // Vehicles
  {
    id: "truck",
    name: "Production Truck",
    icon: Truck,
    width: 2.6,
    length: 12,
    category: "Vehicles"
  },
  {
    id: "car",
    name: "Passenger Car",
    icon: Car,
    width: 1.8,
    length: 4.5,
    category: "Vehicles"
  },
  {
    id: "rv",
    name: "RV",
    icon: Warehouse,
    width: 2.5,
    length: 8,
    category: "Vehicles"
  },
  // Facilities
  {
    id: "porta-potty",
    name: "Porta Potty",
    icon: Warehouse,
    width: 1.2,
    length: 1.2,
    category: "Facilities"
  },
  {
    id: "double-banger",
    name: "Double Banger",
    icon: Warehouse,
    width: 2.4,
    length: 1.2,
    category: "Facilities"
  },
  {
    id: "triple-banger",
    name: "Triple Banger",
    icon: Warehouse,
    width: 3.6,
    length: 1.2,
    category: "Facilities"
  },
  {
    id: "makeup-trailer",
    name: "Makeup Trailer",
    icon: Warehouse,
    width: 2.5,
    length: 10,
    category: "Facilities"
  },
  {
    id: "costumes-trailer",
    name: "Costumes Trailer",
    icon: Warehouse,
    width: 2.5,
    length: 12,
    category: "Facilities"
  },
  // Miscellaneous
  {
    id: "tent",
    name: "10x10 Tent",
    icon: Tent,
    width: 3,
    length: 3,
    category: "Miscellaneous"
  },
  {
    id: "table",
    name: "6' Table",
    icon: Table,
    width: 0.75,
    length: 1.8,
    category: "Miscellaneous"
  },
  {
    id: "chair",
    name: "Director's Chair",
    icon: Armchair,
    width: 0.6,
    length: 0.6,
    category: "Miscellaneous"
  }
];

// Fix the Set iteration TypeScript error by converting to array first
export const categories = Array.from(new Set(objects.map(obj => obj.category)));