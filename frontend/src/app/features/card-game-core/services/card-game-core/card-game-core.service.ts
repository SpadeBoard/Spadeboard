import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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

  userId: WritableSignal<string> = signal<string>('');

  isCardsCollectionMenuOpen: WritableSignal<boolean>=  signal<boolean>(false);
  isCardEditorOpen: WritableSignal<boolean>=  signal<boolean>(false);

  // https://medium.com/@dev.ashaysawarkar/communicating-between-sibling-components-in-angular-using-rxjs-subject-4e5382dcca34
  // Use subjects to communicate between siblings?

  constructor() { }


  setUserId(newUserId: string) {
    this.userId.set(newUserId);
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
}
