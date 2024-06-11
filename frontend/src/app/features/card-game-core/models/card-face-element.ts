import { AngularEditorConfig } from "@kolkov/angular-editor";
import { DndItem } from "../../drag-and-drop/models/dnd-item";
import { Style } from "../../style/models/style";

export interface CardFaceElement {
    cardFaceElementId: number;
    cardFaceId: number; // THIS SHOULD BE FINE BECAUSE DND ITEM HAS STYLING REFERENCE
    cardFaceElementContent: string;
    cardFaceElementType?: string;
    dndItem?: DndItem;
    style?: Style;
}

export type CardFaceRte = CardFaceElement & AngularEditorConfig;