import { DndItem } from "../../drag-and-drop/models/dnd-item";

export interface Zone extends DndItem {
    zoneId: number;
    containeeIds: number[];
    maxChildren?: number;
}
