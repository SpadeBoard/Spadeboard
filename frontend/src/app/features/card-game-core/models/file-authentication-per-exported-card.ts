import { CardEditorCardDto } from "./card";

export interface FileAuthenticationPerExportedCard {
    fileAuthenticationPerExportedCardId: string;
    cardId: string;
    cardEditorCardDto: CardEditorCardDto;
    fileHash: string;
    digitalSignature: string;
}