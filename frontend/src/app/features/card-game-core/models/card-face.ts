import { Style } from "../../style/models/style";
import { CardFaceElementPerCardFace } from "./card-face-element";

export interface CardFace {
    cardFaceId: string;
    style: Style;
    cardFaceThumbnailFilePath?: string/* | Blob*/;
}

export interface CardEditorCardFaceDto {
    cardFace: CardFace;
    cardFaceElementsPerCardFace: CardFaceElementPerCardFace[];
}
