import { Dimensions } from "ngx-image-cropper";
import { Style } from "../../style/models/style";
import { CardEditorCardFaceDto, CardFace } from "../models/card-face";
import { CardFaceImage } from "./card-face.utils";
import { clamp, stringify } from "../../../utils/utils";
import { MAX_BORDER_RADIUS, MIN_BORDER_RADIUS } from "./card-editor.constants";

export const DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH: string = '/app/backend/card-face-thumbnail-images';

export const DEFAULT_CARD_FACE_PLACEHOLDER_SRC: string = '/blank-card-canvas.svg';
export const DEFAULT_CARD_FACE_PLACEHOLDER_ALT: string = 'Placeholder card face';

export const DEFAULT_CARD_FACE_DIMENSIONS: Dimensions = {
    width: 154,
    height: 215
}

export function getDefaultCardFaceImage(src: string, alt: string, dimensions: Dimensions): CardFaceImage {
    return {
        src,
        alt,
        dimensions
    };
}

export function getDefaultCardFace(cardFaceId: string = "0", style: Style = {
    styleId: "0"
}): CardFace {
    return {
        cardFaceId: cardFaceId,
        style: style
    }
}

export function clampBorderRadius(radius: number): number {
    return clamp(radius, MIN_BORDER_RADIUS, MAX_BORDER_RADIUS);
}

// TODO: Combine with the other doValuesMatch and areRefsIdentical
export function doValuesMatch(cardEditorCardFaceDtos:  Array<CardEditorCardFaceDto[]>): boolean {
    return cardEditorCardFaceDtos.every((value: CardEditorCardFaceDto[], index: number, array: Array<CardEditorCardFaceDto[]>) => index === array.length - 1 || stringify(value) === stringify(array[index + 1]));
}