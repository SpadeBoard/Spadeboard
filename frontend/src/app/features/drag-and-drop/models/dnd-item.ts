import { Style } from "../../style/models/style";
import { DndDragBoundary, DndPosition } from "./dnd-types";

export interface DndItem {
    dndItemId: string;
    isDraggable: boolean;
    isDroppable: boolean;
    isRotatable: boolean;
}