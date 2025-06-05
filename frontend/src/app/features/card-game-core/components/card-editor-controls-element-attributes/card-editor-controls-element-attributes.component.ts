import { Component, computed, inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Dimensions } from 'ngx-image-cropper';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
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
        debounceTime(300),
        takeUntilDestroyed()
      )
      .subscribe((width: number) => {
        width = clamp(width, MIN_CARD_FACE_WIDTH, MAX_CARD_FACE_HEIGHT);     
        this.cardEditorControlsDesignElementAttributesService.setWidth(width);
      });
  }

  setHeight(): void {
    this.height$$
      .pipe(
        debounceTime(300),
        takeUntilDestroyed()
      )
      .subscribe((height: number) => {
        height = clamp(height, MIN_CARD_FACE_WIDTH, MAX_CARD_FACE_HEIGHT);
        this.cardEditorControlsDesignElementAttributesService.setHeight(height);
      }
      );
  }

  setX(): void {
    this.x$$
      .pipe(
        debounceTime(300),
        takeUntilDestroyed()
      )
      .subscribe((x: number) => {
        x = clamp(x, 0, MAX_CARD_FACE_WIDTH);
        this.cardEditorControlsDesignElementAttributesService.setX(x);
      }
    );
  }

  setY(): void {
    this.y$$
      .pipe(
        debounceTime(300),
        takeUntilDestroyed()
      )
      .subscribe((y: number) => {
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
    })
  };

  onSetHeight(): void {
    this.cardEditorControlsDesignElementAttributesService.onSetHeight$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((height: number) => {
        this.dimensions.height = height;
    })
  }

  onSetX(): void {
    this.cardEditorControlsDesignElementAttributesService.onSetX$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((x: number) => {
        this.coordinates.x = x;
      })
  }

  onSetY(): void {
    this.cardEditorControlsDesignElementAttributesService.onSetY$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((y: number) => {
        this.coordinates.y= y;
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
