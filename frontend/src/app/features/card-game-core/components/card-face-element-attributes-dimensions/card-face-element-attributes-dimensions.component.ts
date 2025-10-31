import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { clamp, Coordinates, Dimensions } from '../../../../utils/utils';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/attributes/card-editor-controls-design-element-attributes.service';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH, MAX_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';

@Component({
  selector: 'app-card-face-element-attributes-dimensions',
  imports: [FormsModule],
  templateUrl: './card-face-element-attributes-dimensions.component.html',
  styleUrl: './card-face-element-attributes-dimensions.component.scss'
})
export class CardFaceElementAttributesDimensionsComponent {
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  // https://dev.to/mana95/how-to-use-rxjs-debounce-time-with-angular-4aj5
  // https://stackoverflow.com/questions/43998536/debounce-to-get-a-value-input-in-angular2
  // Subjects for debouncing each input
  // Question is if we use template reference and debounce that, is it going to cause a circular dependency
  private readonly width$$: Subject<number> = new Subject<number>();
  private readonly height$$: Subject<number> = new Subject<number>();

  // FIXME: This is a hacky fix
  @ViewChild('widthInput') widthRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heightInput') heightRef!: ElementRef<HTMLInputElement>;

  protected dimensions: Dimensions = {
    width: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH,
    height: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT
  }

  private readonly DEBOUNCE_TIME = 300;

  constructor() {
    this.resetElementAttributes();

    this.onSetWidth();
    this.onSetHeight();

    this.setWidth();
    this.setHeight();
  }

  protected onWidthChange(width: number): void {
    this.width$$.next(width);
  }

  protected onHeightChange(height: number): void {
    this.height$$.next(height);
  }

  // FIXME: Not sure why distinctUntilChanged is causing issues here
  private onSetWidth(): void {
    this.width$$
      .pipe(
        debounceTime(this.DEBOUNCE_TIME),
        takeUntilDestroyed()
      )
      .subscribe((width: number) => {
        if (isNaN(width)) width = MIN_CARD_FACE_WIDTH;

        width = clamp(width, MIN_CARD_FACE_WIDTH, MAX_CARD_FACE_HEIGHT);
        this.cardEditorControlsDesignElementAttributesService.setWidth(width);
      });
  }

  private onSetHeight(): void {
    this.height$$
      .pipe(
        debounceTime(this.DEBOUNCE_TIME),
        takeUntilDestroyed()
      )
      .subscribe((height: number) => {
        if (isNaN(height)) height = MIN_CARD_FACE_WIDTH;

        height = clamp(height, MIN_CARD_FACE_WIDTH, MAX_CARD_FACE_HEIGHT);
        this.cardEditorControlsDesignElementAttributesService.setHeight(height);
      }
      );
  }

  protected setWidth(): void {
    this.cardEditorControlsDesignElementAttributesService.setWidth$
      .pipe(
        // distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((width: number) => {
        this.dimensions.width = width;

        if (this.widthRef.nativeElement) this.widthRef.nativeElement.value = `${width}`;
      })
  };

  protected setHeight(): void {
    this.cardEditorControlsDesignElementAttributesService.setHeight$
      .pipe(
        // distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((height: number) => {
        this.dimensions.height = height;

        if (this.heightRef.nativeElement) this.heightRef.nativeElement.value = `${height}`;
      })
  }

  private resetElementAttributes(): void {
    this.cardEditorControlsDesignElementAttributesService.resetedElementAttributes$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((attributes: { coordinates: Coordinates, dimensions: Dimensions }) => {
        this.dimensions = attributes.dimensions;
      })
  }
}
