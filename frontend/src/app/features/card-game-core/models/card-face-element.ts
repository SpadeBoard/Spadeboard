import { AngularEditorConfig } from "@kolkov/angular-editor";
import { DndItemDto } from "../../drag-and-drop/models/dnd-item";
import { Style } from "../../style/models/style";

// TODO: Make a CardFaceElementDto and use that instead for frontend
export interface CardFaceElement {
    cardFaceElementId: number;
    cardFaceId: number; // THIS SHOULD BE FINE BECAUSE DND ITEM HAS STYLING REFERENCE
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

export type CardFaceRte = CardFaceElement & AngularEditorConfig;