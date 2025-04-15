import { Style } from "../../style/models/style";

export interface CardFace {
    cardFaceId: number;
    style: Style;
    cardFaceThumbnailFilePath?: string/* | Blob*/;
}
