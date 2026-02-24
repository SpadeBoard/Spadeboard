import { Card } from "../../card/models/card";
import { CardEditorCardFaceDto } from "./card-editor-card-face-dto";

export interface CardEditorCardDto {
    card: Card;
    cardEditorCardFacesDto: Array<CardEditorCardFaceDto>;
    tagNames: Array<string>;
    ownerId?: string;
}