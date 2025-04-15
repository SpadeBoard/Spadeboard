import { Component, effect, inject, input, InputSignal } from '@angular/core';
import { Card } from '../../models/card';
import { CardApiService } from '../../services/card-api.service';
import { CardComponent } from '../card/card.component';
import { CdkDrag, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-cards-collection',
  imports: [ 
    CardComponent,
    CdkDrag, CdkDragHandle, DragDropModule
  ],
  templateUrl: './cards-collection.component.html',
  styleUrl: './cards-collection.component.css'
})
export class CardsCollectionComponent {
  isCardsCollectionMenuOpenInput: InputSignal<boolean>=  input<boolean>(false);

  public isCardsCollectionMenuOpen: boolean = false;
  private userId: string = "5811e387-1551-4090-9485-a3ebe30efb5a";
  
  private cardApiService = inject(CardApiService);
  
  cards: Card[] =[];

  constructor() {
    effect(() => {
      if (this.isCardsCollectionMenuOpenInput() !== undefined) {
        this.isCardsCollectionMenuOpen = this.isCardsCollectionMenuOpenInput();

        this.populateCardsCollection();
      }
    });
  }
  
  getCards(): void {
    this.cardApiService.getCards(
      // ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'undefined'. Current value: '{"width":85,"height":853}'. Expression location: _GameRoomComponent component.
      this.userId).subscribe((result: Card[] | undefined) => {
        if (result !== undefined)
        {
          this.cards = result;
          return;
        }
    });
  }

  // ASSUMPTION: Checks to see if there needs to be a new card added to the menu
  doesUserHaveMoreCards(): boolean {
    let userHasMoreCards: boolean = false;
    this.cardApiService.getCards(
      // ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'undefined'. Current value: '{"width":85,"height":853}'. Expression location: _GameRoomComponent component.
      this.userId).subscribe((result: Card[] | undefined) => {
        if (result !== undefined && result.length > this.cards.length)
        {
          userHasMoreCards = true;
          return;
        }
    });

    return userHasMoreCards;
  }

  getLatestCard(id: number): void {
    this.cardApiService.getCard(
      id, this.userId).subscribe((result: Card | undefined) => {
        if (result !== undefined)
        {
          this.cards.push(result);
        }
    });
  }

  // TODO: Make a component for the cards menu, and what we wanna do
    // is if the amount of cards is less than the amount of cards in the database for this user
    // We'd then grab that new card at that index, and then add it onto the cards
  populateCardsCollection() {
    if (this.isCardsCollectionMenuOpen == false)
      return;

    if (this.cards.length <= 0) {
      this.getCards();
      console.log(`On cards: ${JSON.stringify(this.cards)}`);

      return;
    }

    // ASSUMPTION: Arrays here start at 0 but Postgres starts with 1
    if (this.doesUserHaveMoreCards() == true) {
      this.getLatestCard(this.cards.length);

      return;
    }
  }
}
