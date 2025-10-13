import { ActionContextMenuItem } from "../../actions-context-menu/models/action-context-menu-item";
import { Card } from "../models/card";
import { CardEditorPreviewService } from "../services/card-editor-preview.service";
import { CardGameCoreService } from "../services/card-game-core/card-game-core.service";

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

export function getEditCard(): ActionContextMenuItem {
    return {
        id: 1,
        name: 'Edit Card',
        action: (params: {cardId: string, cardEditorPreviewService: CardEditorPreviewService, cardGameCoreService: CardGameCoreService}) => {
            let {cardId, cardEditorPreviewService, cardGameCoreService} = params;

            if (!cardEditorPreviewService || !cardGameCoreService) return;
            
            cardEditorPreviewService.getCardEditorCardDtoByCardId(cardId);
            cardGameCoreService.setIsCardEditorOpen(!cardGameCoreService.isCardEditorOpen());
        },
        disabled: false
    }
}

// CHECKME: Could passing in arguments from the main function and action cause issues with consistency?
export function getDeleteCard(currentContextMenuId: string, cardEditorPreviewService: CardEditorPreviewService): ActionContextMenuItem {
    return {
        id: 2,
        name: 'Delete Card',
        action: (params: {cardId: string, cardEditorPreviewService: CardEditorPreviewService}) => {
            let {cardId, cardEditorPreviewService} = params;

            if (cardId === cardEditorPreviewService.cardEditorCardDto.card.cardId) return;
            cardEditorPreviewService.deleteCard(cardId);
        },
        disabled: ((currentContextMenuId === cardEditorPreviewService.cardEditorCardDto.card.cardId)) ? true : false
    }
}