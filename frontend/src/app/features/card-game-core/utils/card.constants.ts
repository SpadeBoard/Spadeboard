import { ActionContextMenuItem } from "../../actions-context-menu/models/action-context-menu-item";
import { Card } from "../models/card";

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