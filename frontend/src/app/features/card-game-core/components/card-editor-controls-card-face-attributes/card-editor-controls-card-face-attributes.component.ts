import { Component, inject } from '@angular/core';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { BorderDimensions, Style } from '../../../style/models/style';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { FormsModule } from '@angular/forms';
import { CardFaceAttributesBorderWidthComponent } from '../card-face-attributes-border-width/card-face-attributes-border-width.component';
import { clamp } from '../../../../utils/utils';
@Component({
  selector: 'app-card-editor-controls-card-face-attributes',
  imports: [ColorPickerComponent, FormsModule, CardFaceAttributesBorderWidthComponent],
  templateUrl: './card-editor-controls-card-face-attributes.component.html',
  styleUrl: './card-editor-controls-card-face-attributes.component.css'
})
export class CardEditorControlsCardFaceAttributesComponent {
  // TODO: Probably grab these default values from the editor preview service
  private _cardFaceColor: string = "#fefffe";
  
  private _borderColor: string = "";

  borderRadius: number = 5;

  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

  constructor() 
  {
    this.setCardFaceAttributes();
    this.postFlip();
  }

  private postFlip() {
    this.cardEditorPreviewService.postFlip$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.setCardFaceAttributes();
      });
  }

  get cardFaceId() {
    return this.cardEditorControlsDesignCardFaceAttributesService.cardFaceId;
  }

  get cardFaceColor() {
    return this._cardFaceColor;
  }

  set cardFaceColor(newColor: string) {
    if (this._cardFaceColor !== newColor) {
      this._cardFaceColor = newColor;
      
      this.cardEditorControlsDesignCardFaceAttributesService.setOnFaceColorChange(this.cardFaceColor);
    }
  }

  get borderColor() {
    return this._borderColor;
  }

   set borderColor(newColor: string) {
    if (this._borderColor !== newColor) {
      this._borderColor = newColor;

      this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderColorChange(this.borderColor);
    }
  }

  get borderWidth() {
    return  this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions.borderWidth;
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

  private setCardFaceAttributes()
  {
    let currentCardFaceStyle: Style= this.cardEditorPreviewService.getCurrentCardFace().style;
    this.cardFaceColor = (currentCardFaceStyle.backgroundColor) ?? "#fefffe";

    if (currentCardFaceStyle.borderRadius) {
      let numericValue = currentCardFaceStyle.borderRadius.match(/[\d.]+/);
      if (numericValue) {
        this.borderRadius = parseFloat(numericValue[0]);
      }
    }

     if (currentCardFaceStyle.borderWidth) {
      let numericValue: RegExpMatchArray | null = currentCardFaceStyle.borderWidth.match(/[\d.]+/);
      
      if (numericValue) {
        this.borderWidth = parseFloat(numericValue[0]);

        let input: string | undefined;
        let match: RegExpMatchArray | null;

        input = currentCardFaceStyle.borderTopWidth;
        match = input ? input.match(/[+-]?\d*\.?\d+/) : null;
        this.borderTopWidth = match ? parseFloat(match[0]) : this.borderWidth;

        input = currentCardFaceStyle.borderBottomWidth;
        match = input ? input.match(/[+-]?\d*\.?\d+/) : null;
        this.borderBottomWidth = match ? parseFloat(match[0]) : this.borderWidth;

        input = currentCardFaceStyle.borderLeftWidth;
        match = input ? input.match(/[+-]?\d*\.?\d+/) : null;
        this.borderLeftWidth= match ? parseFloat(match[0]) : this.borderWidth;

        input = currentCardFaceStyle.borderRightWidth;
        match = input ? input.match(/[+-]?\d*\.?\d+/) : null;
        this.borderRightWidth = match ? parseFloat(match[0]) : this.borderWidth;
      }
    }

    this.borderColor = (currentCardFaceStyle.borderColor) ?? "#fefffe";
  }

 onBorderRadiusChange(event: Event) {
  let value = (event.target as HTMLInputElement).value;
  this.borderRadius =  parseFloat(value);

  this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderRadiusChange(this.borderRadius);
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
    height = clamp(height, 0, this.cardEditorPreviewService.MAX_CARD_FACE_HEIGHT);

    this.cardEditorControlsDesignCardFaceAttributesService.height = height;
    this.cardEditorControlsDesignCardFaceAttributesService.setHeight(height);
  }

  set width(width: number) {
    // console.log(`Element attributes - Set Width`);
    width = clamp(width, 0, this.cardEditorPreviewService.MAX_CARD_FACE_WIDTH);

    this.cardEditorControlsDesignCardFaceAttributesService.width = width;
    this.cardEditorControlsDesignCardFaceAttributesService.setWidth(width);
  }

  get borderDimensions(): BorderDimensions {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions;
  }

  set borderDimensions(newBorderDimensions: BorderDimensions) {
    this.cardEditorControlsDesignCardFaceAttributesService.borderDimensions = newBorderDimensions;
    this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderDimensionsChange(newBorderDimensions);
  }
}
