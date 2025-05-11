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

  // currentCardFaceElementId: WritableSignal<number> = signal<number>(-1);
  // https://stackoverflow.com/questions/42504918/difference-between-ngmodel-and-ngmodel-for-binding-state-to-property
  private currentCardFaceElementId: string = "";
  
  private _height: number = 0;
  private _width: number = 0;
  private _x: number = 0;
  private _y: number = 0;

  constructor() { }

  get height(): number {
    return this._height;
  }

  get width(): number {
    return this._width;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  // NOTE: In the resizable component, use - distinctUntilChanged()
  set height(height: number) {
    this._height = height;
  }

  set width( width: number) {
    this._width =  width;
  }

  set y(y: number) {
    this._y = y;
  }

  set x( x: number) {
    this._x =  x;
  }

  setCurrentCardFaceElementId(currentCardFaceElementId: string): void {
    this.currentCardFaceElementId = currentCardFaceElementId;
  }

  getCurrentCardFaceElementId(): string {
    return this.currentCardFaceElementId;
  }

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
