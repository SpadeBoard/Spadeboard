import { Card, CardDto } from "../models/card";
import { CardFaceElement, CardFaceElementDto } from "../models/card-face-element";
import { Deck } from "../models/deck";

// Are interfaces so we can't do instanceof to check
export function isCard(obj: any): obj is Card {
    return obj
        && typeof obj === 'object'
        && 'cardId' in obj
        && 'frontFaceCardId' in obj
        && 'backCardFaceId' in obj
        && 'ownerId' in obj
        && 'dndItemId' in obj
        && 'isFlipped' in obj;// Adjust based on Card properties
}

export function isCardDto(obj: any): obj is CardDto {
    return obj
        && typeof obj === 'object'
        && 'card' in obj
        && 'frontCardFace' in obj
        && 'backCardFace' in obj
        // && 'frontCardFaceElements' in obj
        // && 'backCardFaceElements' in obj
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