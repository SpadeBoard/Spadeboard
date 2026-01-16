import { AngularEditorConfig } from "@kolkov/angular-editor";
import { DndItem } from "../../drag-and-drop/models/dnd-item";
import { Style } from "../../style/models/style";
import { DndDragBoundary, DndPosition } from "../../drag-and-drop/models/dnd-types";
import { FileMetadata } from "../../../utils/models/file-metadata";

export interface CardFaceElement {
  cardFaceElementType: 'Rt' | 'Image';
  cardFaceElementId: string;
  style?: Style;
}

export interface CardFaceElementRt extends CardFaceElement {
  cardFaceElementType: 'Rt';
  cardFaceElementContent: string;
}

export interface CardFaceElementImage extends CardFaceElement {
  cardFaceElementType: 'Image';
  imageFileMetadata?: FileMetadata;
}

export interface CardFaceElementPerCardFace {
    cardFaceElementPerCardFaceId: string;
    cardFaceElement: CardFaceElement;
    dndItem: DndItem;
    dndPosition: DndPosition;
    dndDragBoundary?: DndDragBoundary;
}

export type CardFaceRte = CardFaceElement & AngularEditorConfig;