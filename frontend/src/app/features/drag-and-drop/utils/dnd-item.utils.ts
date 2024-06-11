import { DndItem } from "../models/dnd-item";

export function isDndItem(obj: any): obj is DndItem {
    return obj
        && typeof obj === 'object'
        && 'dndItemId' in obj
        && 'isDraggable' in obj
        && 'isDroppable' in obj
        && 'dndPosition' in obj
        && 'styleId' in obj; // Adjust based on DndItem properties
}