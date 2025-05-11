import { Style } from "../../style/models/style";
import { DndDragBoundary, DndPosition } from "./dnd-types";

export interface DndItem {
    dndItemId: string;
    isDraggable: boolean;
    isDroppable: boolean;
    /*dndPosition: DndPosition;
    dndDragBoundary?: DndDragBoundary;
    style?: Style;*/
}

// TODO: Figure out whether style should be part of dndItem or not
export interface DndItemDto {
    dndItem: DndItem;
    dndPosition: DndPosition;
    dndDragBoundary?: DndDragBoundary;
    style?: Style;
}