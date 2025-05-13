import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CardPositionPerRoomApiService } from './card-position-per-room-api.service';
import { CardEditorCardDto, CardPositionPerRoom } from '../../models/card';

@Injectable({
  providedIn: 'root'
})
export class CardGameCoreService {
  // https://medium.com/@jaydeepvpatil225/observables-and-subjects-in-angular-a4d73dfa5bb
  // Dynamic multicast delegates?
  private cardPositionPerRoomId$$: Subject<number> = new Subject<number>();
  cardPositionPerRoomId$: Observable<number> = this.cardPositionPerRoomId$$.asObservable();

  private cardPositionPerRoom$$ = new Subject<CardPositionPerRoom>();
  cardPositionPerRoom$: Observable<CardPositionPerRoom> = this.cardPositionPerRoom$$.asObservable();

  private onCreateCardEditorCardDto$$ = new Subject<CardEditorCardDto>();
  onCreateCardEditorCardDto$: Observable<CardEditorCardDto> = this.onCreateCardEditorCardDto$$.asObservable();

  private onUpdateCardEditorCardDto$$ = new Subject<CardEditorCardDto>();
  onUpdateCardEditorCardDto$: Observable<CardEditorCardDto> = this.onUpdateCardEditorCardDto$$.asObservable();

  userId: WritableSignal<string> = signal<string>('');

  isCardsCollectionMenuOpen: WritableSignal<boolean>=  signal<boolean>(false);
  isCardEditorOpen: WritableSignal<boolean>=  signal<boolean>(false);

  cardEditorCardDto: WritableSignal<CardEditorCardDto> = signal<CardEditorCardDto> ({
    card: {
      cardId: "0",
      currentCardFaceIndex: 0,
      cardName: '',
      isTemplate: false
    },
    ownerId: '',
    cardEditorCardFacesDto: []
  });

  // NOTE: Use this with the card collection to load latest
  createdCardEditorCardDtoForCardCollection: WritableSignal<CardEditorCardDto> = signal<CardEditorCardDto> ({
    card: {
      cardId: "0",
      currentCardFaceIndex: 0,
      cardName: '',
      isTemplate: false
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

   setIsCardEditorOpen(newIsCardEditOpen: boolean): void {
    this.isCardEditorOpen.set(newIsCardEditOpen);
  }

  createCardPositionPerRoom(cpr: CardPositionPerRoom ): void {
    this.cardPositionPerRoom$$.next(cpr);
  }

  onCreateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.onCreateCardEditorCardDto$$.next(cardEditorCardDto);
  }

  onUpdateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.onUpdateCardEditorCardDto$$.next(cardEditorCardDto);
  }
}
