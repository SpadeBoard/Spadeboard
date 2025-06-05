import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BorderDimensions, Style } from '../../style/models/style';
import { CardEditorPreviewService } from './card-editor-preview.service';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignCardFaceAttributesService {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
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

  get cardFaceColor(): string {
    return this._cardFaceColor;
  }

  set cardFaceColor(color: string) {
    this._cardFaceColor = color;
  }

  set borderRadius(borderRadius: number) {
    this._borderRadius = borderRadius;
  }

  // TODO: Use constants from the default style 
  // Just get rid of the setters and getters, there's no point of having them
  private _cardFaceColor: string = "#fefffe";
  private _borderColor: string = "#fefffe";

  get borderColor(): string {
    return this._borderColor;
  }

  set borderColor(color: string) {
    this._borderColor = color;
  }

  private _height: number = 415;
  private _width: number = 351;
  private _borderRadius: number = 10;

  private _borderDimensions: BorderDimensions = {
    borderWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2
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

  setCardFaceAttributes() {
    let currentCardFaceStyle: Style = this.cardEditorPreviewService.getCurrentCardFace().style;
        this.cardFaceColor = (currentCardFaceStyle.backgroundColor) ?? "#fefffe";
    
        if (currentCardFaceStyle.borderRadius) {
          // Because it's going to be in pxs
          let numeric: string = currentCardFaceStyle.borderRadius.replace(/[^0-9.]/g, '');
          if (numeric) {
            this.borderRadius = parseFloat(numeric);
          }
        }
    
        if (currentCardFaceStyle.borderWidth) {
          let numericValue: RegExpMatchArray | null = currentCardFaceStyle.borderWidth.match(/[\d.]+/);
    
          if (numericValue) {
            this.borderDimensions.borderWidth = parseFloat(numericValue[0]);
    
            let input: string | undefined;
            let match: RegExpMatchArray | null;
    
            input = currentCardFaceStyle.borderTopWidth;
            match = input ? input.match(/[+-]?\d*\.?\d+/) : null;
            this.borderDimensions.borderTopWidth = match ? parseFloat(match[0]) : this.borderDimensions.borderWidth;
    
            input = currentCardFaceStyle.borderBottomWidth;
            match = input ? input.match(/[+-]?\d*\.?\d+/) : null;
            this.borderDimensions.borderBottomWidth = match ? parseFloat(match[0]) : this.borderDimensions.borderWidth;
    
            input = currentCardFaceStyle.borderLeftWidth;
            match = input ? input.match(/[+-]?\d*\.?\d+/) : null;
            this.borderDimensions.borderLeftWidth = match ? parseFloat(match[0]) : this.borderDimensions.borderWidth;
    
            input = currentCardFaceStyle.borderRightWidth;
            match = input ? input.match(/[+-]?\d*\.?\d+/) : null;
            this.borderDimensions.borderRightWidth = match ? parseFloat(match[0]) : this.borderDimensions.borderWidth;
          }
        }
    
        this.borderColor = (currentCardFaceStyle.borderColor) ?? "#fefffe";
  }
}
