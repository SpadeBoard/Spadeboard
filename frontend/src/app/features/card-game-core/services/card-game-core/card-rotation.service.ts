import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardRotationService {

  private cardRotation$$: Subject<{cardId: string, degrees: number}> = new Subject<{cardId: string, degrees: number}>();
  public readonly cardRotation$: Observable<{cardId: string, degrees: number}> = this.cardRotation$$.asObservable();

  constructor() { }

  public setCardRotation(info: {cardId: string, degrees: number}): void {
    this.cardRotation$$.next(info);
  }
}
