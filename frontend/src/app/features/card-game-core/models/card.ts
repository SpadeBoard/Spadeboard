import { DndItem } from "../../drag-and-drop/models/dnd-item";
import { DndPosition } from "../../drag-and-drop/models/dnd-types";
import { Style } from "../../style/models/style";
import { CardFace } from "./card-face";
import { CardFaceElement, CardFaceElementDto } from "./card-face-element";

// TODO: Instead of having DndItem itself, have the card extends the item
export interface Card {
    cardId: number;
    frontCardFaceId: number
    backCardFaceId: number
    ownerId?: string // temp
    isFlipped: boolean,
    dndItem?: DndItem,  // TODO: Get rid of this for the card, just use the CardPositionPerRoom data somehow
    style?: Style, // TODO: Get rid of this for the card, just use the CardPositionPerRoom data somehow
    dndPosition?: DndPosition // TODO: Get rid of this, just use the bridge table
}

export interface CardDto {
    card: Partial<Card>;
    frontCardFace?: Partial<CardFace>;
    frontCardFaceStyle?: Partial<Style>;
    frontCardFaceElements?: Array<Partial<CardFaceElement>>;
    frontCardFaceElementsDto?: Array<Partial<CardFaceElementDto>>;
    frontCardFaceElementStyles?: Array<Partial<Style>>;

    backCardFace?: Partial<CardFace>;
    backCardFaceStyle?: Partial<Style>;
    backCardFaceElements?: Array<Partial<CardFaceElement>>
    backCardFaceElementsDto?: Array<Partial<CardFaceElementDto>>
    backCardFaceElementStyles?: Array<Partial<Style>>;

    dndItem?: Partial<DndItem>;
}
