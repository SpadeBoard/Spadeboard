import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { clamp } from '../../../../utils/utils';
import { BorderDimensions } from '../../../style/models/style';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardFaceAttributesBorderWidthComponent } from '../card-face-attributes-border-width/card-face-attributes-border-width.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
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

  constructor() {
    this.onSetCardEditorCardDtoByCardId();  
    this.postFlip();
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

  get cardFaceId() {
    return this.cardEditorControlsDesignCardFaceAttributesService.cardFaceId;
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

  get borderWidth() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderWidth;
  }

  set borderWidth(newBorderWidth: number) {
    if (this.borderWidth !== newBorderWidth) {
      this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderWidth = newBorderWidth;

      this.setBorderDimensions();
    }
  }

  get borderTopWidth() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderTopWidth;
  }

  set borderTopWidth(newBorderTop: number) {
    if (this.borderTopWidth !== newBorderTop) {
      this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderTopWidth = newBorderTop;

      this.setBorderDimensions();
    }
  }

  get borderBottomWidth() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderBottomWidth;
  }

  set borderBottomWidth(newBorderBottom: number) {
    if (this.borderBottomWidth !== newBorderBottom) {
      this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderBottomWidth = newBorderBottom;

      this.setBorderDimensions();
    }
  }

  setBorderDimensions() {
    let borderDimensions: BorderDimensions = {
      borderWidth: this.borderWidth,
      borderBottomWidth: this.borderBottomWidth,
      borderTopWidth: this.borderTopWidth,
      borderLeftWidth: this.borderLeftWidth,
      borderRightWidth: this.borderRightWidth
    }

    this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions = borderDimensions;
    this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderDimensionsChange(
      borderDimensions);
  }

  get borderLeftWidth() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderLeftWidth;
  }

  set borderLeftWidth(newBorderLeft: number) {
    if (this.borderLeftWidth !== newBorderLeft) {
      this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderLeftWidth = newBorderLeft;

      this.setBorderDimensions();
    }
  }

  get borderRightWidth() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderRightWidth;
  }

  set borderRightWidth(newBorderRight: number) {
    if (this.borderRightWidth !== newBorderRight) {
      this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderRightWidth = newBorderRight;

      this.setBorderDimensions();
    }
  }

  get borderRadius() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderRadius;
  }

  set borderRadius(borderRadius: number) {
    borderRadius = clamp(borderRadius, 0.01, this.cardEditorPreviewService.MAX_BORDER_RADIUS);
    
    this.cardEditorControlsDesignCardFaceAttributesService.borderRadius = borderRadius;
    this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderRadiusChange(borderRadius);
  
     if (this.borderRadiusRef && this.borderRadiusRef.nativeElement && this.borderRadiusRef.nativeElement.value !== `${borderRadius}`) {
      this.borderRadiusRef.nativeElement.value = `${borderRadius}`;
    }
  }

  get maxWidth(): number {
    return this.cardEditorPreviewService.MAX_CARD_FACE_WIDTH;
  }

  get maxHeight(): number {
    return this.cardEditorPreviewService.MAX_CARD_FACE_HEIGHT;
  }

  get maxBorderRadius(): number {
    return this.cardEditorPreviewService.MAX_BORDER_RADIUS;
  }

  get height(): number {
    // console.log(`Element attributes - Get Height`);
    return this.cardEditorControlsDesignCardFaceAttributesService.height;
  }

  get width(): number {
    // console.log(`Element attributes - Get Width`);
    return this.cardEditorControlsDesignCardFaceAttributesService.width;
  }

  set height(height: number) {
    // console.log(`Element attributes - Set Height`);
    // https://stackoverflow.com/a/63300675
    height = clamp(height, 0, this.cardEditorPreviewService.MAX_CARD_FACE_HEIGHT);

    this.cardEditorControlsDesignCardFaceAttributesService.height = height;
    this.cardEditorControlsDesignCardFaceAttributesService.setHeight(height);

    if (this.heightRef && this.heightRef.nativeElement && this.heightRef.nativeElement.value !== `${height}`) {
      this.heightRef.nativeElement.value = `${height}`;
    }
  }

  set width(width: number) {
    // console.log(`Element attributes - Set Width`);
    width = clamp(width, 0, this.cardEditorPreviewService.MAX_CARD_FACE_WIDTH);

    this.cardEditorControlsDesignCardFaceAttributesService.width = width;
    this.cardEditorControlsDesignCardFaceAttributesService.setWidth(width);

    if (this.widthRef && this.widthRef.nativeElement && this.widthRef.nativeElement.value !== `${width}`) {
      this.widthRef.nativeElement.value = `${width}`;
    }
  }

  get borderDimensions(): BorderDimensions {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions;
  }

  set borderDimensions(newBorderDimensions: BorderDimensions) {
    this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions = newBorderDimensions;
    this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderDimensionsChange(newBorderDimensions);
  }
}
