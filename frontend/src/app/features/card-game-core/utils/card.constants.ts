import { Coordinates } from "../../../utils/utils";
import { DndPosition } from "../../drag-and-drop/models/dnd-position";
import { CardPositionPerRoom } from "../card-position-per-room/model/card-position-per-room";
import { Card } from "../card/models/card";

export const DEFAULT_CARD_SCALE: number = 0.45;

export function getCardPositionPerRoom(card: Card, coordinates: Coordinates, globalZIndexCounter: number): CardPositionPerRoom {
    return {
        cardPositionPerRoomId: "0",
        card: card,
        dndItem: {
            dndItemId: "0",
            isDraggable: false,
            isDroppable: false,
            isRotatable: true
        },
        dndPosition: {
            dndPositionId: "0", x: coordinates.x, y: coordinates.y
        } as DndPosition,
        dndRotation: {
            dndRotationId: "0",
            degrees: 0
        },
        gameRoom: {
            gameRoomId: "1", // FIXME: Replace this with getting the actual current game room
            autosaveInterval: 30000,
            dndBoardSize: 1000
        },
        zIndex: isFinite(globalZIndexCounter) ? globalZIndexCounter++ : (globalZIndexCounter = 1, 0)
    };
}