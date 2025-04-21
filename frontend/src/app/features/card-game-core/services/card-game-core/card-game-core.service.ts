import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { CardPositionPerRoomApiService } from './card-position-per-room-api.service';
import { CardEditorCardDto, CardPositionPerRoom } from '../../models/card';

@Injectable({
  providedIn: 'root'
})
export class CardGameCoreService {
  // https://medium.com/@jaydeepvpatil225/observables-and-subjects-in-angular-a4d73dfa5bb
  // Dynamic multicast delegates?
  private cardPositionPerRoomId = new Subject<number>();
  cardPositionPerRoomId$ = this.cardPositionPerRoomId.asObservable();

  private cardPositionPerRoom = new Subject<CardPositionPerRoom>();
  cardPositionPerRoom$ = this.cardPositionPerRoom.asObservable();

  userId: WritableSignal<string> = signal<string>('');

  isCardsCollectionMenuOpen: WritableSignal<boolean>=  signal<boolean>(false);

  cardEditorCardDto: WritableSignal<CardEditorCardDto> = signal<CardEditorCardDto> ({
    card: {
      cardId: 0,
      isFlipped: false,
      currentCardFaceIndex: 0
    },
    ownerId: '',
    cardEditorCardFacesDto: []
  });

  // https://medium.com/@dev.ashaysawarkar/communicating-between-sibling-components-in-angular-using-rxjs-subject-4e5382dcca34
  // Use subjects to communicate between siblings?

  constructor() { }


  setUserId(newUserId: string) {
    this.userId.set(newUserId);
  }

  setCardEditorCardDto(newCardEditorCardDto: CardEditorCardDto) {
    this.cardEditorCardDto.set(newCardEditorCardDto);
  }

  setIsCardsCollectionMenuOpen(newIsCardsCollectionMenuOpen: boolean): void {
    this.isCardsCollectionMenuOpen.set(newIsCardsCollectionMenuOpen);
  }

  createCardPositionPerRoom(cpr: CardPositionPerRoom ): void {
    this.cardPositionPerRoom.next(cpr);
  }
}
