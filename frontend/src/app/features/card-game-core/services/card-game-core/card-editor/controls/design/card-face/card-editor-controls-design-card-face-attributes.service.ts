import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, merge, Observable, Subject, Subscription } from 'rxjs';
import { Dimensions, operate } from '../../../../../../../../utils/utils';
import { BorderDimensions, Style } from '../../../../../../../style/models/style';
import { CardFace } from '../../../../../../models/card-face';
import { DEFAULT_CARD_FACE_BACKGROUND_COLOR, DEFAULT_CARD_FACE_BORDER_COLOR, DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CARD_FACE_BORDER_WIDTH, DEFAULT_CARD_FACE_HEIGHT, DEFAULT_CARD_FACE_WIDTH } from '../../../../../../utils/card-editor.constants';
import { CardEditorPreviewService } from '../../../preview/card-editor-preview.service';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignCardFaceAttributesService {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  public cardFaceHexcode: string = DEFAULT_CARD_FACE_BACKGROUND_COLOR;
  public borderHexcode: string = DEFAULT_CARD_FACE_BORDER_COLOR;

  public cardFaceHexInput: string = DEFAULT_CARD_FACE_BACKGROUND_COLOR;
  public borderHexInput: string = DEFAULT_CARD_FACE_BORDER_COLOR;

  public borderRadius: number = DEFAULT_CARD_FACE_BORDER_RADIUS;

  public cardFaceDimensions: Dimensions = {
    width: DEFAULT_CARD_FACE_WIDTH,
    height: DEFAULT_CARD_FACE_HEIGHT
  }

  public borderDimensions: BorderDimensions = {
    borderWidth: DEFAULT_CARD_FACE_BORDER_WIDTH,
    borderRect: {
      top: DEFAULT_CARD_FACE_BORDER_WIDTH,
      bottom: DEFAULT_CARD_FACE_BORDER_WIDTH,
      left: DEFAULT_CARD_FACE_BORDER_WIDTH,
      right: DEFAULT_CARD_FACE_BORDER_WIDTH
    }
  }

  public cardFaceId: WritableSignal<string> = signal<string>("");

  private setWidth$$: Subject<number> = new Subject<number>();
  public readonly setWidth$: Observable<number> = this.setWidth$$.asObservable();

  private setHeight$$: Subject<number> = new Subject<number>();
  public readonly setHeight$: Observable<number> = this.setHeight$$.asObservable();

  private faceColorChange$$: Subject<string> = new Subject<string>();
  public readonly faceColorChange$: Observable<string> = this.faceColorChange$$.asObservable();

  private borderColorChange$$: Subject<string> = new Subject<string>();
  public readonly borderColorChange$: Observable<string> = this.borderColorChange$$.asObservable();

  private borderRadiusChange$$: Subject<number> = new Subject<number>();
  public readonly borderRadiusChange$: Observable<number> = this.borderRadiusChange$$.asObservable();

  private borderWidthChange$$: Subject<number> = new Subject<number>();
  public readonly borderWidthChange$: Observable<number> = this.borderWidthChange$$.asObservable();

  private borderDimensionsChange$$: Subject<BorderDimensions> = new Subject<BorderDimensions>();
  public readonly borderDimensionsChange$: Observable<BorderDimensions> = this.borderDimensionsChange$$.asObservable();

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor() { }

  public setOnFaceColorChange(color: string): void {
    this.faceColorChange$$.next(color);
  }

  public setOnBorderRadiusChange(borderRadius: number): void {
    this.borderRadiusChange$$.next(borderRadius);
  }

  public setOnBorderColorChange(borderHexcode: string): void {
    this.borderColorChange$$.next(borderHexcode);
  }

  public setHeight(height: number): void {
    this.setHeight$$.next(height);
  }

  public setWidth(width: number): void {
    this.setWidth$$.next(width);
  }

  public setOnBorderDimensionsChange(borderDimensions: BorderDimensions): void {
    this.borderDimensionsChange$$.next(borderDimensions);
  }

  public setOnBorderWidthChange(borderWidth: number): void {
    this.borderWidthChange$$.next(borderWidth);
  }

  public setCurrentCardFaceId(cardFaceId: string): void {
    this.cardFaceId.set(cardFaceId);
  }

  public setCardFaceAttributes(): void {
    let currentCardFace: CardFace = this.cardEditorPreviewService.getCurrentCardFace();

    this.cardFaceId.set(currentCardFace.cardFaceId)
    let currentCardFaceStyle: Style = currentCardFace.style;

    this.cardFaceDimensions = {
      width: this.extractCardFaceWidth(currentCardFaceStyle.width) ?? DEFAULT_CARD_FACE_WIDTH,
      height: this.extractCardFaceHeight(currentCardFaceStyle.height) ?? DEFAULT_CARD_FACE_HEIGHT
    }

    this.cardFaceHexcode = (currentCardFaceStyle.backgroundColor) ?? DEFAULT_CARD_FACE_BACKGROUND_COLOR;
    this.cardFaceHexInput = (this.cardFaceHexcode)

    this.borderRadius = this.extractBorderRadius(currentCardFaceStyle.borderRadius);
    this.borderDimensions = this.extractBorderDimensions(currentCardFaceStyle);

    this.borderHexcode = (currentCardFaceStyle.borderColor) ?? DEFAULT_CARD_FACE_BORDER_COLOR;
    this.borderHexInput = (this.borderHexcode)
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

  public areBorderDimensionsEqual(): boolean {
    let { borderWidth } = this.borderDimensions;

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

  public cardFaceDimensionsAttributes(cardFaceDimensionsOperations: Map<string, Function>): void {
    merge(
      this.setWidth$.pipe(
        map((value: number) => ({ operation: 'w', emitted: value }))
      ),
      this.setHeight$.pipe(
        map((value: number) => ({ operation: 'h', emitted: value }))
      ))
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result: { operation: string, emitted: number }) => {
        operate(result, cardFaceDimensionsOperations);

        // setCardEditorFaceStyle(face); CHECKME: This should be mutable so no need for this
      });
  }

  public cardFaceColorAttributes(cardFaceColorOperations: Map<string, Function>): Subscription {
    return merge(
      this.faceColorChange$.pipe(
        map((appearance: string) => ({ operation: 'face', emitted: appearance }))
      ),
      this.borderColorChange$.pipe(
        map((appearance: string) => ({ operation: 'edge', emitted: appearance }))
      )
    )
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result: ({ operation: string, emitted: string })) => {
        operate(result, cardFaceColorOperations);

        // setCardEditorFaceStyle(face); CHECKME: This should be mutable so no need for this
      });
  }

  public borderDimensionsChange(borderDimensionsOperation: Function): Subscription {
    return this.borderDimensionsChange$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((bd: BorderDimensions) => {
        borderDimensionsOperation(bd);
      });
  }

  public borderRadiusChange(borderRadiusOperation: Function): Subscription {
    return this.borderRadiusChange$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((radius: number) => {
        borderRadiusOperation(radius);
      });
  }
}
