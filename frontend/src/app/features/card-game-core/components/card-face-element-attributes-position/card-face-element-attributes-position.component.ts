import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, map, merge, Subject } from 'rxjs';
import { clamp, Coordinates, Dimensions, operate } from '../../../../utils/utils';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/attributes/card-editor-controls-design-element-attributes.service';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';

@Component({
  selector: 'app-card-face-element-attributes-position',
  imports: [FormsModule],
  templateUrl: './card-face-element-attributes-position.component.html',
  styleUrl: './card-face-element-attributes-position.component.scss'
})
export class CardFaceElementAttributesPositionComponent {
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  private readonly x$$: Subject<number> = new Subject<number>();

  private readonly y$$: Subject<number> = new Subject<number>();

  protected coordinates: Coordinates = {
    x: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X,
    y: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y
  }

  private positionOperations: Map<string, Function> = new Map<string, Function>([
    ['x', (value: number) => this.setPosition(value, MAX_CARD_FACE_WIDTH, this.cardEditorControlsDesignElementAttributesService.setX)],
    ['y', (value: number) => this.setPosition(value, MAX_CARD_FACE_HEIGHT, this.cardEditorControlsDesignElementAttributesService.setY)]
  ]);

  // FIXME: This is a hacky fix
  @ViewChild('xInput') xRef!: ElementRef<HTMLInputElement>;
  @ViewChild('yInput') yRef!: ElementRef<HTMLInputElement>;

  private readonly DEBOUNCE_TIME = 300;

  constructor() {
    this.resetElementAttributes();

    this.setPosition$$(this.positionOperations);

    this.onSetX();
    this.onSetY();

    this.setX();
    this.setY();
  }

  public onXChange(x: number): void {
    this.x$$.next(x);
  }

  public onYChange(y: number): void {
    this.y$$.next(y);
  }

  public setPosition$$(positionOperations: Map<string, Function>): void {
    merge(
      this.x$$.pipe(
        map((x: number) => ({ operation: 'x', emitted: x }))
      ),
      this.y$$.pipe(
        map((y: number) => ({ operation: 'y', emitted: y }))
      )
    )
      .pipe(
        debounceTime(this.DEBOUNCE_TIME),
        takeUntilDestroyed()
      )
      .subscribe((result: ({ operation: string, emitted: number })) => {
        operate(result, positionOperations);
      });
  }

  private setPosition(value: number, max: number, fn: Function): void {
    fn(isNaN(value) ? 0 : clamp(value, 0, max));
  }

  public setX(): void {
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

  public setY(): void {
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

  public onSetX(): void {
    this.cardEditorControlsDesignElementAttributesService.setX$
      .pipe(
        // distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((x: number) => {
        this.coordinates.x = x;

        if (this.xRef.nativeElement) this.xRef.nativeElement.value = `${x}`;
      })
  }

  public onSetY(): void {
    this.cardEditorControlsDesignElementAttributesService.setY$
      .pipe(
        // distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((y: number) => {
        this.coordinates.y = y;

        if (this.yRef.nativeElement) this.yRef.nativeElement.value = `${y}`;
      })
  }

  public resetElementAttributes(): void {
    this.cardEditorControlsDesignElementAttributesService.resetedElementAttributes$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((attributes: { coordinates: Coordinates, dimensions: Dimensions }) => {
        this.coordinates = attributes.coordinates;
      })
  }
}
