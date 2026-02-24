import { FileMetadata } from "../../../../utils/models/file-metadata";
import { CardFaceElementPerCardFace } from "../../card-face-element/models/card-face-element";
import { CardFace } from "../../card-face/models/card-face";

export interface CardEditorCardFaceDto {
    cardFace: CardFace;
    fileMetadataLods: FileMetadata[];
    cardFaceElementsPerCardFace: CardFaceElementPerCardFace[];
}