import { DndItem } from "../../drag-and-drop/models/dnd-item";
import { Style } from "../../style/models/style";
import { CardFace } from "./card-face";
import { CardFaceElement } from "./card-face-element";

// TODO: Instead of having DndItem itself, have the card extends the item
export interface Card {
    cardId: number;
    frontCardFaceId: number
    backCardFaceId: number
    ownerId?: string // temp
    isFlipped: boolean,
    dndItem?: DndItem,
    style?: Style
}

export interface CardDto {
    card: Partial<Card>;
    frontCardFace?: Partial<CardFace>;
    frontCardFaceStyle?: Partial<Style>;
    frontCardFaceElements?: Array<Partial<CardFaceElement>>;
    frontCardFaceElementStyles?: Array<Partial<Style>>;

    backCardFace?: Partial<CardFace>;
    backCardFaceStyle?: Partial<Style>;
    backCardFaceElements?: Array<Partial<CardFaceElement>>
    backCardFaceElementStyles?: Array<Partial<Style>>;

    dndItem?: Partial<DndItem>;
}
