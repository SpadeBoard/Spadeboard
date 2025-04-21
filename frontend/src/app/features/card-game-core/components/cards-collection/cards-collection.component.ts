import { Component, effect, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Card, CardPositionPerRoom } from '../../models/card';
import { CardApiService } from '../../services/card-game-core/card-api.service';
import { CardComponent } from '../card/card.component';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { catchError, map, Observable, of } from 'rxjs';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';

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
  private userId: string = "5811e387-1551-4090-9485-a3ebe30efb5a";
  
  private mousePosition = { x: 0, y: 0 };

  cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private cardApiService: CardApiService = inject(CardApiService);
  
  cards: Card[] =[];

  constructor() {
    // TODO: Might want to do a behavior subject instead where we get the latest card based on when we add the card
    effect(() => {
      if (this.cardGameCoreService.isCardsCollectionMenuOpen()) {
        this.populateCardsCollection();
      }

      if (this.cardGameCoreService.userId() !== '' || this.cardGameCoreService.userId() !== null) {
        this.userId = this.cardGameCoreService.userId();
      }
    });
  }
  
  getCards(): void {
    this.cardApiService.getCards$(
      this.userId).subscribe((result: Card[] | undefined) => {
        if (result !== undefined)
        {
          this.cards = result;
          return;
        }
    });
  }

  // https://v17.angular.io/guide/observables
  // ASSUMPTION: Checks to see if there needs to be a new card added to the menu
  private doesUserHaveMoreCards(): Observable<boolean> {
    return this.cardApiService.getCards$(this.userId).pipe(
      map((result: Card[] | undefined) => {
        return result !== undefined && result.length > this.cards.length;
      }),
      catchError((err: any) => {
        console.error('Does user have more cards emitted an error: ' + err);
        return of(false);
      })
    );
  }

  // https://rxjs.dev/api/operators/catchError
  // https://angular.dev/guide/templates/pipes

  private getLatestCard(id: number): void {
    this.cardApiService.getCard$(
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
  private populateCardsCollection() {
    if (this.cards.length <= 0) {
      this.getCards();
      console.log(`On cards: ${JSON.stringify(this.cards)}`);

      return;
    }

    // ASSUMPTION: Postgres records start from 1, so grab the length of the cards and add 1 to get correct index
    this.doesUserHaveMoreCards().subscribe((userHasMore: boolean) => {
      if (userHasMore) {
        this.getLatestCard(this.cards.length + 1);
      }
    });
  }

  onDragMoved(event: CdkDragMove) {
    this.mousePosition = event.pointerPosition;
  }

  onDragDrop(event: CdkDragDrop<any[]>, item: any) {
    // TODO: Check to see if it's outside of the menu, if it is, then emit
    if (!event.isPointerOverContainer) {
      let cpr: CardPositionPerRoom = {
        cardPositionPerRoomId: 0,
        card: item as Card,
        dndItem: {
          dndItemId: 1,
          isDraggable: false,
          isDroppable: false
        },
        dndPosition: {x: event.dropPoint.x, y: event.dropPoint.y} as DndPosition,
        gameRoom: {
          gameRoomId: 1
        }
      };

      this.createCardPositionPerRoom(cpr);
      
      console.log("Is outside the cards collection menu");
    }

    console.log(`Previous Container: ${event.previousContainer}, Container: ${event.container}, Is point over container: ${event.isPointerOverContainer}, Drop point: ${JSON.stringify(event.dropPoint)}, Mouse position: ${JSON.stringify(this.mousePosition)}`);
  }

  private createCardPositionPerRoom(cpr: CardPositionPerRoom) {
    this.cardGameCoreService.createCardPositionPerRoom(cpr);
  }

  // TODO: Refactor, use the gameRoomService here and the cardPositionPerRoomApiService here instead, pass in the item index for the subject to then communicate with the DndBoard
}
