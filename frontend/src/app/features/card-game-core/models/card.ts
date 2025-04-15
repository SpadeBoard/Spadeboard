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
    ownerId?: string //  TODO: To be removed
    isFlipped: boolean,
    dndItem?: DndItem,  // TODO: Get rid of this for the card, just use the CardPositionPerRoom data somehow
    style?: Style, // TODO: Get rid of this for the card, just use the CardPositionPerRoom data somehow
    dndPosition?: DndPosition // TODO: Get rid of this, just use the bridge table
}

export interface CardDto {
    card: Partial<Card>;
    frontCardFace?: Partial<CardFace>;
    frontCardFaceElements?: Array<Partial<CardFaceElement>>;
    frontCardFaceElementsDto?: Array<Partial<CardFaceElementDto>>;

    backCardFace?: Partial<CardFace>;
    backCardFaceElements?: Array<Partial<CardFaceElement>>;
    backCardFaceElementsDto?: Array<Partial<CardFaceElementDto>>

    dndItem?: Partial<DndItem>;
    ownerId?: string;
}
