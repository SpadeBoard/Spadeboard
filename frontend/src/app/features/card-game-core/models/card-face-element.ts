import { AngularEditorConfig } from "@kolkov/angular-editor";
import { DndItem, DndItemDto } from "../../drag-and-drop/models/dnd-item";
import { Style } from "../../style/models/style";
import { DndDragBoundary, DndPosition } from "../../drag-and-drop/models/dnd-types";

// TODO: Make a CardFaceElementDto and use that instead for frontend
export interface CardFaceElement {
    cardFaceElementId: number;
    cardFaceElementContent: string;
    cardFaceElementType?: string;
    style?: Style;
}

// TODO: Fix DndItem to where it is either separated from DndPosition or has a DndItemDto
export interface CardFaceElementDto {
    cardFaceElement: CardFaceElement;
    dndItemDto: DndItemDto;
    // style?: Style;
}

export interface CardFaceElementPerCardFace {
    cardFaceElement: CardFaceElement;
    dndItem: DndItem;
    dndPosition: DndPosition;
    dndDragBoundary?: DndDragBoundary;
}

export type CardFaceRte = CardFaceElement & AngularEditorConfig;