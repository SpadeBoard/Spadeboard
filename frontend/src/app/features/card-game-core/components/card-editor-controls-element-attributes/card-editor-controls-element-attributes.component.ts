import { Component, computed, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Dimensions } from 'ngx-image-cropper';
import { debounceTime, Subject } from 'rxjs';
import { clamp, Coordinates } from '../../../../utils/utils';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { CardEditorControlsElementLayeringAttributesComponent } from '../card-editor-controls-element-layering-attributes/card-editor-controls-element-layering-attributes.component';

@Component({
  selector: 'app-card-editor-controls-element-attributes',
  imports: [FormsModule, CardEditorControlsElementLayeringAttributesComponent],
  templateUrl: './card-editor-controls-element-attributes.component.html',
  styleUrl: './card-editor-controls-element-attributes.component.css'
})
export class CardEditorControlsElementAttributesComponent {
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  // https://dev.to/mana95/how-to-use-rxjs-debounce-time-with-angular-4aj5
  // https://stackoverflow.com/questions/43998536/debounce-to-get-a-value-input-in-angular2
  // Subjects for debouncing each input
  // Question is if we use template reference and debounce that, is it going to cause a circular dependency
  private readonly width$$ = new Subject<number>();
  private readonly height$$ = new Subject<number>();
  private readonly x$$ = new Subject<number>();
  private readonly y$$ = new Subject<number>();

  id: Signal<string> = computed(() => this.cardEditorControlsDesignElementAttributesService.currentCardFaceElementId() ?? DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

  dimensions: Dimensions = {
    width: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH,
    height: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT
  }

  coordinates: Coordinates = {
    x: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X,
    y: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y
  }

  // FIXME: This is a hacky fix
  @ViewChild('widthInput') widthRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heightInput') heightRef!: ElementRef<HTMLInputElement>;
  @ViewChild('xInput') xRef!: ElementRef<HTMLInputElement>;
  @ViewChild('yInput') yRef!: ElementRef<HTMLInputElement>;

  private readonly DEBOUNCE_TIME = 300;

  constructor() {
    this.onSetWidth();
    this.onSetHeight();

    this.onResetCardFaceAttributes();

    this.onSetX();
    this.onSetY();

    this.setWidth();
    this.setHeight();

    this.setX();
    this.setY();
  }

  // FIXME: Not sure why distinctUntilChanged is causing issues here
  setWidth(): void {
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

  setHeight(): void {
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



  onWidthChange(width: number): void {
    this.width$$.next(width);
  }

  onHeightChange(height: number): void {
    this.height$$.next(height);
  }

  onXChange(x: number): void {
    this.x$$.next(x);
  }

  onYChange(y: number): void {
    this.y$$.next(y);
  }



  onSetWidth(): void {
    this.cardEditorControlsDesignElementAttributesService.onSetWidth$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((width: number) => {
        this.dimensions.width = width;

        if (this.widthRef.nativeElement) this.widthRef.nativeElement.value = `${width}`;
    })
  };

  onSetHeight(): void {
    this.cardEditorControlsDesignElementAttributesService.onSetHeight$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((height: number) => {
        this.dimensions.height = height;

        if (this.heightRef.nativeElement) this.heightRef.nativeElement.value = `${height}`;
    })
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
        this.dimensions = attributes.dimensions;
    })
  }
}
