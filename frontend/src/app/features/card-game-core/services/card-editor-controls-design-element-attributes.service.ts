import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignElementAttributesService {
  private onSetMaxHeight$$ = new Subject<number>();
  onSetMaxHeight$: Observable<number> = this.onSetMaxHeight$$.asObservable();

  private onSetMaxWidth$$ = new Subject<number>();
  onSetMaxWidth$: Observable<number> = this.onSetMaxWidth$$.asObservable();

  private onSetWidth$$ = new Subject<number>();
  onSetWidth$: Observable<number> = this.onSetWidth$$.asObservable();

  private onSetHeight$$ = new Subject<number>();
  onSetHeight$: Observable<number> = this.onSetHeight$$.asObservable();

  private onSetY$$ = new Subject<number>();
  onSetY$: Observable<number> = this.onSetY$$.asObservable();

  private onSetX$$ = new Subject<number>();
  onSetX$: Observable<number> = this.onSetX$$.asObservable();

  currentCardFaceElementId: WritableSignal<number> = signal<number>(-1);


  constructor() { }

  setY(y: number) {
    this.onSetY$$.next(y);
  }
  
  setX(x: number) {
    this.onSetX$$.next(x);
  }

  setMaxHeight(maxHeight: number) {
    this.onSetMaxHeight$$.next(maxHeight);
  }

  setMaxWidth(maxWidth: number) {
    this.onSetMaxWidth$$.next(maxWidth);
  }

  setHeight(height: number) {
    this.onSetHeight$$.next(height);
  }

  setWidth(width: number) {
    this.onSetWidth$$.next(width);
  }
}
