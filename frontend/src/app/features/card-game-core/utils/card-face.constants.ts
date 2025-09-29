import { Dimensions } from "ngx-image-cropper";
import { CardFaceImage } from "./card-face.utils";
import { CardFace } from "../models/card-face";
import { Style } from "../../style/models/style";

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