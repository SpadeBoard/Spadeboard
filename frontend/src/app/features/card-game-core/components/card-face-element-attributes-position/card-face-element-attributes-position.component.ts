import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { clamp, Coordinates, Dimensions } from '../../../../utils/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card-face-element-attributes-position',
  imports: [FormsModule],
  templateUrl: './card-face-element-attributes-position.component.html',
  styleUrl: './card-face-element-attributes-position.component.css'
})
export class CardFaceElementAttributesPositionComponent {
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  private readonly x$$ = new Subject<number>();
  private readonly y$$ = new Subject<number>();

  coordinates: Coordinates = {
    x: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X,
    y: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y
  }

  // FIXME: This is a hacky fix
  @ViewChild('xInput') xRef!: ElementRef<HTMLInputElement>;
  @ViewChild('yInput') yRef!: ElementRef<HTMLInputElement>;

  private readonly DEBOUNCE_TIME = 300;

  constructor() {
    this.onResetCardFaceAttributes();

    this.onSetX();
    this.onSetY();

    this.setX();
    this.setY();
  }

  setX(): void {
    this.x$$
      .pipe(
        debounceTime(this.DEBOUNCE_TIME),
        takeUntilDestroyed()
      )
      .subscribe((x: number) => {
        if (isNaN(x)) x = 0;

        x = clamp(x, 0, MAX_CARD_FACE_WIDTH);
        this.cardEditorControlsDesignElementAttributesService.setX(x);
      }
      );
  }

  setY(): void {
    this.y$$
      .pipe(
        debounceTime(this.DEBOUNCE_TIME),
        takeUntilDestroyed()
      )
      .subscribe((y: number) => {
        if (isNaN(y)) y = 0;

        y = clamp(y, 0, MAX_CARD_FACE_HEIGHT);
        this.cardEditorControlsDesignElementAttributesService.setY(y);
      }
      );
  }

  onXChange(x: number): void {
    this.x$$.next(x);
  }

  onYChange(y: number): void {
    this.y$$.next(y);
  }

  onSetX(): void {
    this.cardEditorControlsDesignElementAttributesService.onSetX$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((x: number) => {
        this.coordinates.x = x;

        if (this.xRef.nativeElement) this.xRef.nativeElement.value = `${x}`;
      })
  }

  onSetY(): void {
    this.cardEditorControlsDesignElementAttributesService.onSetY$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((y: number) => {
        this.coordinates.y = y;

        if (this.yRef.nativeElement) this.yRef.nativeElement.value = `${y}`;
      })
  }

  onResetCardFaceAttributes(): void {
    this.cardEditorControlsDesignElementAttributesService.onResetCardFaceAttributes$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((attributes: { coordinates: Coordinates, dimensions: Dimensions }) => {
        this.coordinates = attributes.coordinates;
      })
  }
}
