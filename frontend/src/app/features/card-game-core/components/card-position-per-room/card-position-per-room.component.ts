import { Component, effect, inject, Injectable, input  } from '@angular/core';
import { CardPositionPerRoomApiService } from '../../services/card-position-per-room-api.service';
import { CardPositionPerRoom } from '../../models/card';
import { CdkDrag} from '@angular/cdk/drag-drop';
import { CardComponent } from '../card/card.component';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';

@Component({
  selector: 'app-card-position-per-room',
  imports: [
    CdkDrag,
    CardComponent
  ],
  templateUrl: './card-position-per-room.component.html',
  styleUrl: './card-position-per-room.component.css'
})
export class CardPositionPerRoomComponent {
  private cardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  gameRoomIdInput = input<number | undefined>(undefined);


  cprs: CardPositionPerRoom[] = [];

  constructor() {
    effect(() => {
      if (this.gameRoomIdInput() === undefined)
        return;

        let gameRoomId: number | undefined = this.gameRoomIdInput();

        if (gameRoomId === undefined)
          return;

        this.getCardsPositionPerRoomByRoomId(gameRoomId);
    });
  }
  
  // Reference: https://www.angularspace.com/creating-custom-rxresource-api-with-observables/
  getCardsPositionPerRoomByRoomId(gameRoomId: number): void {
    // TODO
    this.cardPositionPerRoomApiService.getCardsPositionPerRoomByRoomId(
      gameRoomId).subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result !== undefined)
          this.cprs = result;
    });
  }

  findCardPositionPerRoom(cardId: number): CardPositionPerRoom | undefined{
    return this.cprs.find((cpr) => cpr.card.cardId == cardId);
  }

  // TODO: Create?
  createCardPositionPerRoom(cpr: CardPositionPerRoom) {
    this.cardPositionPerRoomApiService.createCardPositionPerRoom(cpr).subscribe((result: CardPositionPerRoom | undefined) => {
      if (result !== undefined)
        this.cprs.push(result);
    });
  }

  addCardToBoard(cardId: number, dndPosition: DndPosition) {
    // TODO: Get the card via the ID as well as position

    // TODO: Create a new card position per room
  }

  // TODO: Update to the backend based on idle period
  updateCardPositionPerRoom(newCpr: CardPositionPerRoom) {

  }

  deleteCardPositionPerRoom(id: number) {
    // TODO: Delete from the bridge table

    // TODO: If it's the only reference in there, then delete the entire card from the database
  }
}
