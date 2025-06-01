import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsElementLayeringAttributesService {
  constructor() { }

  private onBringToFront$$: Subject<void> = new Subject<void>();
  onBringToFront$: Observable<void> = this.onBringToFront$$.asObservable();

  private onSendToBack$$: Subject<void> = new Subject<void>();
  onSendToBack$: Observable<void> = this.onSendToBack$$.asObservable();

  setOnBringToFront(): void {
    this.onBringToFront$$.next();
  }

   setOnSendToBack(): void {
    this.onSendToBack$$.next();
  }
}
