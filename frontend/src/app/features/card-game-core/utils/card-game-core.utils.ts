import { Card } from "../card/models/card";
import { CardPositionPerRoom } from "../card-position-per-room/model/card-position-per-room";
import { CardEditorCardDto } from "../card-editor/models/card-editor-card-dto";
import { CardEditorCardFaceDto } from "../card-editor/models/card-editor-card-face-dto";
import { CardFaceElement, CardFaceElementImage, CardFaceElementPerCardFace } from "../card-face-element/models/card-face-element";
import { Deck } from "../deck/models/deck";

// Are interfaces so we can't do instanceof to check
export function isCard(obj: any): obj is Card {
    return obj
        && typeof obj === 'object'
        && 'cardId' in obj
        && 'cardName' in obj
        && 'currentCardFaceId' in obj
}

export function isCardEditorCardDto(obj: any): obj is CardEditorCardDto {
    return obj
        && typeof obj === 'object'
        && 'card' in obj
        && 'cardEditorCardFacesDto' in obj
}

export function isCardEditorCardFaceDto(obj: any): obj is CardEditorCardFaceDto {
    return obj
        && typeof obj === 'object'
        && 'cardFace' in obj
        && 'fileMetadataLods' in obj
        && 'cardFaceElementsPerCardFace' in obj;
}

export function isCardEditorCardFaceDtoArray(arr: CardEditorCardFaceDto[] | string[]): arr is CardEditorCardFaceDto[] {
    return Array.isArray(arr)
        && arr.length > 0
        && typeof arr[0] === 'object'
        && 'cardFace' in arr[0]
        && 'fileMetadataLods' in arr[0]
        && 'cardFaceElementsPerCardFace' in arr[0];
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
        && 'cardFaceElementType' in obj
        && 'cardFaceElementId' in obj
}

export function isCardFaceElementImage(obj: any): obj is CardFaceElementImage {
    return obj
        && typeof obj === 'object'
        && 'cardFaceElementType' in obj
        && obj.cardFaceElementType === 'Image'
        && 'imageFileMetadata' in obj
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
        && 'zIndex' in obj
        && 'dndItem' in obj
        && 'dndPosition' in obj
        && 'gameRoom' in obj
}