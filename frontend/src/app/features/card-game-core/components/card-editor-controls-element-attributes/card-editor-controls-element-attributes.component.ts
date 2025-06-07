import { Component, computed, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Dimensions } from 'ngx-image-cropper';
import { debounceTime, Subject } from 'rxjs';
import { clamp, Coordinates } from '../../../../utils/utils';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { CardEditorControlsElementLayeringAttributesComponent } from '../card-editor-controls-element-layering-attributes/card-editor-controls-element-layering-attributes.component';
import { CardFaceElementAttributesDimensionsComponent } from '../card-face-element-attributes-dimensions/card-face-element-attributes-dimensions.component';

@Component({
  selector: 'app-card-editor-controls-element-attributes',
  imports: [FormsModule, CardFaceElementAttributesDimensionsComponent, CardEditorControlsElementLayeringAttributesComponent],
  templateUrl: './card-editor-controls-element-attributes.component.html',
  styleUrl: './card-editor-controls-element-attributes.component.css'
})
export class CardEditorControlsElementAttributesComponent {
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  private readonly x$$ = new Subject<number>();
  private readonly y$$ = new Subject<number>();

  id: Signal<string> = computed(() => this.cardEditorControlsDesignElementAttributesService.currentCardFaceElementId() ?? DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

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
        takeUntilDestroyed()
      )
      .subscribe((y: number) => {
        this.coordinates.y= y;

        if (this.yRef.nativeElement) this.yRef.nativeElement.value = `${y}`;
      })
  }

  onResetCardFaceAttributes(): void {
    this.cardEditorControlsDesignElementAttributesService.onResetCardFaceAttributes$
    .pipe(
        takeUntilDestroyed()
      )
      .subscribe((attributes: {coordinates: Coordinates, dimensions: Dimensions}) => {
        this.coordinates = attributes.coordinates;
    })
  }
}
