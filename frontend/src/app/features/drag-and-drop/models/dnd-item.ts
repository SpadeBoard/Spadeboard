import { Style } from "../../style/models/style";
import { DndDragBoundary, DndPosition } from "./dnd-types";

export interface DndItem {
    dndItemId: number;
    isDraggable: boolean;
    isDroppable: boolean;
    dndPosition: DndPosition;
    dndDragBoundary?: DndDragBoundary;
    style?: Style;
}
