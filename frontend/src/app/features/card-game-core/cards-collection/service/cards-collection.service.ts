import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Card } from '../../card/models/card';
import { CardEditorCardDto } from '../../card-editor/models/card-editor-card-dto';
import { CardService } from '../../card/services/facade/card.service';

@Injectable({
  providedIn: 'root'
})
export class CardsCollectionService {
  public $isCardsCollectionMenuOpen: WritableSignal<boolean> = signal<boolean>(false);

  private readonly cardService: CardService = inject<CardService>(CardService);

  constructor() { }

  public setIsCardsCollectionMenuOpen(isCardsCollectionMenuOpen: boolean): void {
    this.$isCardsCollectionMenuOpen.set(isCardsCollectionMenuOpen);
  }

  // TODO: Make a component for the cards menu, and what we wanna do
  // is if the amount of cards is less than the amount of cards in the database for this user
  // We'd then grab that new card at that index, and then add it onto the cards
  public populateCardsCollection(userId: string, cards: Card[]) {
    if (cards.length <= 0) this.cardService.getCards(userId, cards)
  }

  /*
  Potential Issues / Considerations
  Only adds one card per call:
  If the server has many new cards, you’ll need to call onCreateCardEditorCardDto() repeatedly (or use a loop/recursion) to fully sync.
  */

  // ASSUMPTION:
  // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
  // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
  public addCard(cards: Card[], cardEditorCardDto: CardEditorCardDto, userId: string): void {
    if (cardEditorCardDto && cards.length > 0) {
      cards.push({ ...cardEditorCardDto.card });
      return;
    }

    this.populateCardsCollection(userId, cards);
  }

  // ASSUMPTION:
  // It's possible for cards collection to already have cards before adding the new card, i.e., cards you've made before and now are having a new session
  // You might create a new card before opening menu, so without this check, then you'd only ever add the new card that's just created, not loading all of the cards at your dispersal
  public updateCard(cards: Card[], cardEditorCardDto: CardEditorCardDto): void {
    if (cardEditorCardDto && cards.length > 0) {
      let index: number = cards.findIndex((card: Card) => card.cardId === cardEditorCardDto.card.cardId);

      if (index !== -1) cards[index] = { ...cardEditorCardDto.card };
    }
  }

  public deleteCard(cards: Card[], cardId: string): Card[] {
    return cards.filter(c => c.cardId !== cardId);
  }
}
