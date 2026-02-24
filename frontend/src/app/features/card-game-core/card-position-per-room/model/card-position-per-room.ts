import { DndItem } from "../../../drag-and-drop/models/dnd-item";
import { DndPosition } from "../../../drag-and-drop/models/dnd-position";
import { DndRotation } from "../../../drag-and-drop/models/dnd-rotation";
import { GameRoom } from "../../../game-room/models/game-room";
import { Card } from "../../card/models/card";

export interface CardPositionPerRoom {
    cardPositionPerRoomId: string;
    card: Card;
    zIndex: number;
    dndItem: DndItem;
    dndPosition: DndPosition;
    dndRotation: DndRotation;
    gameRoom: GameRoom;
}