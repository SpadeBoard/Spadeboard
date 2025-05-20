import { AngularEditorConfig } from "@kolkov/angular-editor";
import { DndItem, DndItemDto } from "../../drag-and-drop/models/dnd-item";
import { Style } from "../../style/models/style";
import { DndDragBoundary, DndPosition } from "../../drag-and-drop/models/dnd-types";
import { FileMetadata } from "../../../utils/models/file-metadata";

export interface CardFaceElement {
  cardFaceElementType: 'Rte' | 'Image';
  cardFaceElementId: string;
  style?: Style;
}

export interface CardFaceElementRt extends CardFaceElement {
  cardFaceElementType: 'Rte';
  cardFaceElementContent: string;
}

export interface CardFaceElementImage extends CardFaceElement {
  cardFaceElementType: 'Image';
  imageFileMetadata?: FileMetadata;
}

// TODO: Fix DndItem to where it is either separated from DndPosition or has a DndItemDto
export interface CardFaceElementDto {
    cardFaceElement: CardFaceElement;
    dndItemDto: DndItemDto;
    // style?: Style;
}

export interface CardFaceElementPerCardFace {
    cardFaceElementPerCardFaceId: string;
    cardFaceElement: CardFaceElement;
    dndItem: DndItem;
    dndPosition: DndPosition;
    dndDragBoundary?: DndDragBoundary;
}

export type CardFaceRte = CardFaceElement & AngularEditorConfig;