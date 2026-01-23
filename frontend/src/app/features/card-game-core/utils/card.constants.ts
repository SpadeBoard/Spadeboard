import { Coordinates } from "../../../utils/utils";
import { ActionContextMenuItem } from "../../actions-context-menu/models/action-context-menu-item";
import { DndPosition } from "../../drag-and-drop/models/dnd-types";
import { Card, CardPositionPerRoom } from "../models/card";
import { CardFacePerCardApiService } from "../services/card-game-core/api/card-face-per-card-api.service";
import { getCurrentCardFaceId, getCurrentCardFaceIndex, setCurrentCardFaceId } from "./card-editor.constants";

export const DEFAULT_CARD_SCALE: number = 0.45;

export function getFlip(): ActionContextMenuItem {
    return {
        id: 0,
        name: 'Flip',
        action: (params: {
            card: Card
            cards: Card[],
            cardFacePerCardApiService: CardFacePerCardApiService
        }) => {
            if (!params) return;

            let { card, cards, cardFacePerCardApiService } = params;
            if (!card || !cards) return;

            let idx: number = cards.findIndex(c => c.cardId === card.cardId);

            if (idx < 0) return;

            cardFacePerCardApiService.getCardFacesPerCardIds$(card).subscribe((cardFaceIds: string[]) => {
                cards[idx] = {
                    ...card,
                    currentCardFaceId: setCurrentCardFaceId(getCurrentCardFaceIndex(getCurrentCardFaceId(card), cardFaceIds), cardFaceIds)
                };
            });
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