import { inject, Injectable } from '@angular/core';
import { CardPositionPerRoom } from '../models/card';
import { CardPositionPerRoomApiService } from './card-position-per-room-api.service';

@Injectable({
  providedIn: 'root'
})
export class CardPositionPerRoomService {
  private cardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  
  cprs: CardPositionPerRoom[] = [];



  constructor() { }

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

  updateCardPositionPerRoom(newCpr: CardPositionPerRoom) {

  }

  deleteCardPositionPerRoom(id: number) {
    
  }
}
