import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BorderDimensions, Style } from '../../style/models/style';
import { CardFace } from '../models/card-face';
import { DEFAULT_CARD_FACE_BACKGROUND_COLOR, DEFAULT_CARD_FACE_BORDER_COLOR, DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CARD_FACE_BORDER_WIDTH, DEFAULT_CARD_FACE_HEIGHT, DEFAULT_CARD_FACE_WIDTH } from '../utils/card-editor.constants';
import { CardEditorPreviewService } from './card-editor-preview.service';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignCardFaceAttributesService {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
  cardFaceColor: string = DEFAULT_CARD_FACE_BACKGROUND_COLOR;
  borderColor: string = DEFAULT_CARD_FACE_BORDER_COLOR;

  height: number = DEFAULT_CARD_FACE_HEIGHT;
  width: number = DEFAULT_CARD_FACE_WIDTH;
  borderRadius: number = DEFAULT_CARD_FACE_BORDER_RADIUS;

  borderDimensions: BorderDimensions = {
    borderWidth: DEFAULT_CARD_FACE_BORDER_WIDTH,
    borderRect: {
      top: DEFAULT_CARD_FACE_BORDER_WIDTH,
      bottom: DEFAULT_CARD_FACE_BORDER_WIDTH,
      left: DEFAULT_CARD_FACE_BORDER_WIDTH,
      right: DEFAULT_CARD_FACE_BORDER_WIDTH
    }
  }

  cardFaceId: WritableSignal<string> = signal<string>("");

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

  setCurrentCardFaceId() {
    let currentCardFace: CardFace = this.cardEditorPreviewService.getCurrentCardFace();
    this.cardFaceId.set(currentCardFace.cardFaceId);
  }

  setCardFaceAttributes() {
    let currentCardFace: CardFace = this.cardEditorPreviewService.getCurrentCardFace();

   this.cardFaceId.set(currentCardFace.cardFaceId)
    let currentCardFaceStyle: Style = currentCardFace.style;

    this.width =  this.extractCardFaceWidth(currentCardFaceStyle.width) ?? DEFAULT_CARD_FACE_WIDTH;
    this.height = this.extractCardFaceHeight(currentCardFaceStyle.height) ?? DEFAULT_CARD_FACE_HEIGHT;
    
    this.cardFaceColor = (currentCardFaceStyle.backgroundColor) ?? DEFAULT_CARD_FACE_BACKGROUND_COLOR;
    this.borderRadius = this.extractBorderRadius(currentCardFaceStyle.borderRadius);
    this.borderDimensions = this.extractBorderDimensions(currentCardFaceStyle);
    this.borderColor = (currentCardFaceStyle.borderColor) ?? DEFAULT_CARD_FACE_BORDER_COLOR;
  }

  private extractCardFaceWidth(width?: string): number {
    if (!width)
      return DEFAULT_CARD_FACE_WIDTH;

    let numeric: string = width.replace(/[^0-9.]/g, '');
    return parseFloat(numeric);
  }

  private extractCardFaceHeight(height?: string): number {
    if (!height)
      return DEFAULT_CARD_FACE_HEIGHT

    let numeric: string = height.replace(/[^0-9.]/g, '');
    return parseFloat(numeric);
  }

  private extractBorderRadius(borderRadius?: string): number {
    if (!borderRadius) {
      return DEFAULT_CARD_FACE_BORDER_RADIUS;
    }

    let numeric: string = borderRadius.replace(/[^0-9.]/g, '');
    return parseFloat(numeric);
  }

  private extractBorderDimensions(style: Style): BorderDimensions {
    let defaultWidth: number = this.parseBorderWidth(DEFAULT_CARD_FACE_BORDER_WIDTH, style.borderWidth);

    return {
      borderWidth: defaultWidth,
      borderRect: {
        top: this.parseBorderWidth(defaultWidth, style.borderTopWidth),
        bottom: this.parseBorderWidth(defaultWidth, style.borderBottomWidth),
        left: this.parseBorderWidth(defaultWidth, style.borderLeftWidth),
        right: this.parseBorderWidth(defaultWidth, style.borderRightWidth)
      }
    };
  }

  areBorderDimensionsEqual(): boolean {
    let {borderWidth} = this.borderDimensions;

    let {
      top,
      bottom,
      left,
      right
    } = this.borderDimensions.borderRect;

    return (
      borderWidth === top &&
      borderWidth === bottom &&
      borderWidth === left &&
      borderWidth === right
    );
  }

  private parseBorderWidth(fallback: number, value?: string,): number {
    if (!value) return fallback;
    let match: RegExpMatchArray | null = value.match(/[+-]?\d*\.?\d+/);
    return match ? parseFloat(match[0]) : fallback;
  }
}
