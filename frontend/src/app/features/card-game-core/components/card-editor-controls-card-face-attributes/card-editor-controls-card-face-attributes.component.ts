import { Component, computed, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { clamp } from '../../../../utils/utils';
import { BorderDimensions } from '../../../style/models/style';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardFaceAttributesBorderWidthComponent } from '../card-face-attributes-border-width/card-face-attributes-border-width.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { MAX_BORDER_RADIUS, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_BORDER_RADIUS, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
@Component({
  selector: 'app-card-editor-controls-card-face-attributes',
  imports: [ColorPickerComponent, FormsModule, CardFaceAttributesBorderWidthComponent],
  templateUrl: './card-editor-controls-card-face-attributes.component.html',
  styleUrl: './card-editor-controls-card-face-attributes.component.css'
})
export class CardEditorControlsCardFaceAttributesComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

  // Use to set the values properly in the inputs
  @ViewChild('widthInput') widthRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heightInput') heightRef!: ElementRef<HTMLInputElement>;
  @ViewChild('borderRadiusInput') borderRadiusRef!: ElementRef<HTMLInputElement>;

  id: Signal<string> = computed(() => this.cardEditorControlsDesignCardFaceAttributesService.cardFaceId());

  constructor() {
    this.onSetCardEditorCardDtoByCardId();  
    this.postFlip();
  }

  areDimensionsEqual(): boolean {
    return this.cardEditorControlsDesignCardFaceAttributesService.areBorderDimensionsEqual();
  }

  private postFlip() {
    this.cardEditorPreviewService.postFlip$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.cardEditorControlsDesignCardFaceAttributesService.setCardFaceAttributes();
      });
  }

  private onSetCardEditorCardDtoByCardId() {
    this.cardEditorPreviewService.onSetCardEditorCardDtoByCardId$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.cardEditorControlsDesignCardFaceAttributesService.setCardFaceAttributes();
      });
  }

  get cardFaceColor() {
    return this.cardEditorControlsDesignCardFaceAttributesService.cardFaceColor;
  }

  set cardFaceColor(newColor: string) {
    if (this.cardFaceColor !== newColor) {
      this.cardEditorControlsDesignCardFaceAttributesService.cardFaceColor = newColor;

      this.cardEditorControlsDesignCardFaceAttributesService.setOnFaceColorChange(this.cardFaceColor);
    }
  }

  get borderColor() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderColor;
  }

  set borderColor(newColor: string) {
    if (this.borderColor !== newColor) {
      this.cardEditorControlsDesignCardFaceAttributesService.borderColor = newColor;

      this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderColorChange(this.borderColor);
    }
  }

  get borderRadius() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderRadius;
  }

  set borderRadius(borderRadius: number) {
    borderRadius = clamp(borderRadius, MIN_BORDER_RADIUS, MAX_BORDER_RADIUS);
    
    this.cardEditorControlsDesignCardFaceAttributesService.borderRadius = borderRadius;
    this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderRadiusChange(borderRadius);
  
    if (this.borderRadiusRef.nativeElement)  this.borderRadiusRef.nativeElement.value = `${borderRadius}`;
  }

  get minWidth(): number {
    return MIN_CARD_FACE_WIDTH;
  }

  get minHeight(): number {
    return MIN_CARD_FACE_HEIGHT;
  }

  get maxWidth(): number {
    return MAX_CARD_FACE_WIDTH;
  }

  get maxHeight(): number {
    return MAX_CARD_FACE_HEIGHT;
  }

  get minBorderRadius(): number {
    return MIN_BORDER_RADIUS;
  }

  get maxBorderRadius(): number {
    return MAX_BORDER_RADIUS;
  }

  get height(): number {
    return this.cardEditorControlsDesignCardFaceAttributesService.height;
  }

  get width(): number {
    return this.cardEditorControlsDesignCardFaceAttributesService.width;
  }

  set height(height: number) {
    // https://stackoverflow.com/a/63300675
    height = clamp(height, MIN_CARD_FACE_HEIGHT, MAX_CARD_FACE_HEIGHT);

    this.cardEditorControlsDesignCardFaceAttributesService.height = height;
    this.cardEditorControlsDesignCardFaceAttributesService.setHeight(height);

    if (this.heightRef.nativeElement) this.heightRef.nativeElement.value = `${height}`;
  }

  set width(width: number) {
    width = clamp(width, MIN_CARD_FACE_WIDTH, MAX_CARD_FACE_WIDTH);

    this.cardEditorControlsDesignCardFaceAttributesService.width = width;
    this.cardEditorControlsDesignCardFaceAttributesService.setWidth(width);

    if (this.widthRef.nativeElement) this.widthRef.nativeElement.value = `${width}`;
  }

  get borderDimensions(): BorderDimensions {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions;
  }

  set borderDimensions(newBorderDimensions: BorderDimensions) {
    this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions = newBorderDimensions;
    this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderDimensionsChange(newBorderDimensions);
  }
}
