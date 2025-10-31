import { inject, Injectable } from '@angular/core';
import { CardPositionPerRoom } from '../../../models/card';
import { Observable, Subject } from 'rxjs';
import { CardPositionPerRoomApiService } from '../api/card-position-per-room-api.service';

@Injectable({
  providedIn: 'root'
})
export class CardPositionPerRoomService {
  private cardPositionPerRoomApiService: CardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  
  private cprs: CardPositionPerRoom[] = [];

  private createdCardPositionPerRoom$$ = new Subject<CardPositionPerRoom>();
  public readonly createdCardPositionPerRoom$: Observable<CardPositionPerRoom> = this.createdCardPositionPerRoom$$.asObservable();


  constructor() { }

  // Reference: https://www.angularspace.com/creating-custom-rxresource-api-with-observables/
  public getCardsPositionPerRoomByRoomId(gameRoomId: string): void {
    // TODO
    this.cardPositionPerRoomApiService.getCardsPositionPerRoomByRoomId(
      gameRoomId).subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result !== undefined)
          this.cprs = result;
    });
  }

  public findCardPositionPerRoom(cardId: string): CardPositionPerRoom | undefined {
    return this.cprs.find((cpr) => cpr.card.cardId == cardId);
  }

  // TODO: Create?
  public createCardPositionPerRoom(cpr: CardPositionPerRoom): void {
    this.cardPositionPerRoomApiService.createCardPositionPerRoom(cpr).subscribe((result: CardPositionPerRoom | undefined) => {
      if (result !== undefined)
        this.cprs.push(result);
    });
  }

  public createdCardPositionPerRoom(cpr: CardPositionPerRoom): void {
    this.createdCardPositionPerRoom$$.next(cpr);
  }

  public updateCardPositionPerRoom(cpr: CardPositionPerRoom) {
  }

  public deleteCardPositionPerRoom(id: string) {
    
  }
}
