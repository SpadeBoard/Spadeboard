import { Coordinates } from "../../../utils/utils";
import { ActionContextMenuItem } from "../../actions-context-menu/models/action-context-menu-item";
import { DndPosition } from "../../drag-and-drop/models/dnd-types";
import { Card, CardPositionPerRoom } from "../models/card";

export const DEFAULT_CARD_SCALE: number = 0.45;

export function getFlip(): ActionContextMenuItem {
    return {
        id: 0,
        name: 'Flip',
        action: (params: {
            card: Card
            cards: Card[]
        }) => {
            if (!params) return;

            let { card, cards } = params;
            if (!card || !cards) return;

            let idx: number = cards.findIndex(c => c.cardId === card.cardId);
            if (idx !== -1) {
                cards[idx] = {
                    ...card,
                    currentCardFaceIndex: (card.currentCardFaceIndex === 0) ? 1 : 0
                };
            }
        },
        disabled: false
    }
}

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