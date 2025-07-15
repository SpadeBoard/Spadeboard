import { DndItem } from "../../drag-and-drop/models/dnd-item";
import { DndPosition, DndRotation } from "../../drag-and-drop/models/dnd-types";
import { GameRoom } from "../../game-room/models/game-room/game-room";
import { CardEditorCardFaceDto } from "./card-face";

// TODO: Instead of having DndItem itself, have the card extends the item
export interface Card {
    cardId: string;
    cardName: string;
    currentCardFaceIndex: number;
}

// TODO: Make a CardEditorCardDto which has everything including DndPosition

// TODO: Rename this to CardEditorCardDto
export interface CardEditorCardDto {
    card: Card;
    cardEditorCardFacesDto: Array<CardEditorCardFaceDto>;
    tagNames: Array<string>;
    ownerId?: string;
}

// TODO: Replace with the objects themselves?
export interface CardPositionPerRoom {
    cardPositionPerRoomId: string;
    card: Card;
    zIndex: number;
    dndItem: DndItem;
    dndPosition: DndPosition;
    dndRotation: DndRotation;
    gameRoom: GameRoom;
}
