import { FileMetadata } from "../../../utils/models/file-metadata";
import { Style } from "../../style/models/style";
import { CardFaceElementPerCardFace } from "./card-face-element";

export interface CardFace {
    cardFaceId: string;
    style: Style;
    cardFaceThumbnailFileMetadata?: FileMetadata;
}

export interface CardEditorCardFaceDto {
    cardFace: CardFace;
    fileMetadataLods: FileMetadata[];
    cardFaceElementsPerCardFace: CardFaceElementPerCardFace[];
}
