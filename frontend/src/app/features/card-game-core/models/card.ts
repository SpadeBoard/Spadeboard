import { DndItem } from "../../drag-and-drop/models/dnd-item";
import { DndPosition } from "../../drag-and-drop/models/dnd-types";
import { GameRoom } from "../../game-room/models/game-room/game-room";
import { Style } from "../../style/models/style";
import { CardFace, CardEditorCardFaceDto } from "./card-face";
import { CardFaceElement, CardFaceElementDto, CardFaceElementPerCardFace } from "./card-face-element";

// TODO: Instead of having DndItem itself, have the card extends the item
export interface Card {
    cardId: number;
    cardName: string;
    currentCardFaceIndex: number;
}

// TODO: Make a CardEditorCardDto which has everything including DndPosition

// TODO: Rename this to CardEditorCardDto
export interface CardEditorCardDto {
    card: Card;
    cardEditorCardFacesDto: Array<CardEditorCardFaceDto>;
    ownerId?: string;
}

// TODO: Replace with the objects themselves?
export interface CardPositionPerRoom {
    cardPositionPerRoomId: number;
    card: Card;
    dndItem: DndItem;
    dndPosition: DndPosition;
    gameRoom: GameRoom;
}
