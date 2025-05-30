import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardRotationService {

  private onCardRotation$$: Subject<{cardId: string, degrees: number}> = new Subject<{cardId: string, degrees: number}>();
  onCardRotation$: Observable<{cardId: string, degrees: number}> = this.onCardRotation$$.asObservable();

  constructor() { }

  setOnCardRotation(info: {cardId: string, degrees: number}): void {
    this.onCardRotation$$.next(info);
  }
}
