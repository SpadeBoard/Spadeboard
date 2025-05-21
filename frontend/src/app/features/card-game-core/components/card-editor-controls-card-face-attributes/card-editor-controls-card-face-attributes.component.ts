import { Component, inject } from '@angular/core';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { Style } from '../../../style/models/style';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-card-editor-controls-card-face-attributes',
  imports: [ColorPickerComponent, FormsModule],
  templateUrl: './card-editor-controls-card-face-attributes.component.html',
  styleUrl: './card-editor-controls-card-face-attributes.component.css'
})
export class CardEditorControlsCardFaceAttributesComponent {
  // TODO: Probably grab these default values from the editor preview service
  private _cardFaceColor: string = "#fefffe";
  private _borderColor: string = "";

  borderRadius: number = 5;

   private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
   private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService );

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
    this.cardEditorControlsDesignCardFaceAttributesService.height = height;
    this.cardEditorControlsDesignCardFaceAttributesService.setHeight(height);
  }

  set width(width: number) {
    // console.log(`Element attributes - Set Width`);
    this.cardEditorControlsDesignCardFaceAttributesService.width = width;
    this.cardEditorControlsDesignCardFaceAttributesService.setWidth(width);
  }
}
