import { Card, CardEditorCardDto, CardPositionPerRoom } from "../models/card";
import { CardFaceElement, CardFaceElementDto, CardFaceElementPerCardFace } from "../models/card-face-element";
import { Deck } from "../models/deck";
import { CardPositionPerRoomService } from "../services/card-game-core/card-position-per-room.service";

// Are interfaces so we can't do instanceof to check
export function isCard(obj: any): obj is Card {
    return obj
        && typeof obj === 'object'
        && 'cardId' in obj
        && 'currentCardFaceIndex' in obj
        && 'isFlipped' in obj;// Adjust based on Card properties
}

export function isCardEditorCardDto(obj: any): obj is CardEditorCardDto {
    return obj
        && typeof obj === 'object'
        && 'card' in obj
        && 'cardEditorCardFacesDto' in obj
}

export function isDeck(obj: any): obj is Deck {
    return obj
        && typeof obj === 'object'
        && 'zoneId' in obj
        && 'styleId' in obj
        && 'containeeIds' in obj; // Adjust based on Deck properties
}

export function isCardFaceElement(obj: any): obj is CardFaceElement {
    return obj
        && typeof obj === 'object'
        && 'cardFaceElementId' in obj
        && 'cardFaceId' in obj
        && 'cardFaceElementContent' in obj;
}

export function isCardFaceElementDto(obj: any): obj is CardFaceElementDto {
    return obj
        && typeof obj === 'object'
        && 'cardFaceElement' in obj
        && 'dndItemDto' in obj
}

export function isCardFaceElementPerCardFace(obj: any): obj is CardFaceElementPerCardFace {
    return obj
        && typeof obj === 'object'
        && 'cardFaceElement' in obj
        && 'dndItem' in obj
        && 'dndPosition' in obj
}

export function isCardPositionPerRoom(obj: any): obj is CardPositionPerRoom {
    return obj
        && typeof obj === 'object'
        && 'card' in obj
        && 'dndItem' in obj
        && 'dndPosition' in obj
        && 'gameRoom' in obj
}