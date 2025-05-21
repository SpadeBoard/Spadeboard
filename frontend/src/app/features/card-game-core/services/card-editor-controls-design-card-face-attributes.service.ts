import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignCardFaceAttributesService {
  get height(): number {
    return this._height;
  }

  get width(): number {
    return this._width;
  }

  set height(height: number) {
    this._height = height;
  }

  set width( width: number) {
    this._width =  width;
  }

  private _height: number = 0;
  private _width: number = 0;

   private onSetWidth$$ = new Subject<number>();
    onSetWidth$: Observable<number> = this.onSetWidth$$.asObservable();
  
    private onSetHeight$$ = new Subject<number>();
    onSetHeight$: Observable<number> = this.onSetHeight$$.asObservable();

  private onFaceColorChange$$: Subject<string> = new Subject<string>();
  onFaceColorChange$: Observable<string> = this.onFaceColorChange$$.asObservable();

  private onBorderColorChange$$: Subject<string> = new Subject<string>();
  onBorderColorChange$: Observable<string> = this.onBorderColorChange$$.asObservable();

  private onBorderRadiusChange$$: Subject<number> = new Subject<number>();
  onBorderRadiusChange$: Observable<number> = this.onBorderRadiusChange$$.asObservable();

  constructor() { }

  setOnFaceColorChange(color: string) {
    this.onFaceColorChange$$.next(color);
  }

    setOnBorderRadiusChange(borderRadius: number) {
    this.onBorderRadiusChange$$.next(borderRadius);
  }

  setOnBorderColorChange(borderColor: string) {
    this.onBorderColorChange$$.next(borderColor);
  }

  setHeight(height: number) {
    this.onSetHeight$$.next(height);
  }

  setWidth(width: number) {
    this.onSetWidth$$.next(width);
  }
}
