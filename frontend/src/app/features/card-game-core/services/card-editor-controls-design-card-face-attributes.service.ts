import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BorderDimensions } from '../../style/models/style';

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

  get borderRadius(): number {
    return this._borderRadius;
  }

  set borderRadius(borderRadius: number) {
    this._borderRadius = borderRadius;
  }

  private _height: number = 0;
  private _width: number = 0;
  private _borderRadius: number = 0;

  private _borderDimensions: BorderDimensions = {
    borderWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0
  }

  get borderDimensions(): BorderDimensions {
    return this._borderDimensions;
  }

  set borderDimensions(borderDimensions: BorderDimensions) {
    this._borderDimensions = borderDimensions;
  }

  cardFaceId: string = "";

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

  private onBorderWidthChange$$: Subject<number> = new Subject<number>();
  onBorderWidthChange$: Observable<number> = this.onBorderWidthChange$$.asObservable();

  private onBorderDimensionsChange$$: Subject<BorderDimensions> = new Subject<BorderDimensions>();
  onBorderDimensionsChange$: Observable<BorderDimensions> = this.onBorderDimensionsChange$$.asObservable();

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

  setOnBorderDimensionsChange(borderDimensions: BorderDimensions) {
    this.onBorderDimensionsChange$$.next(borderDimensions);
  }

  setOnBorderWidthChange(borderWidth: number) {
   this.onBorderWidthChange$$.next(borderWidth);
  }
}
