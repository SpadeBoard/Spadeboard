import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardFaceAttributesBorderRadiusComponent } from '../card-face-attributes-border-radius/card-face-attributes-border-radius.component';
import { CardFaceAttributesBorderWidthComponent } from '../card-face-attributes-border-width/card-face-attributes-border-width.component';
import { CardFaceAttributesDimensionsComponent } from '../card-face-attributes-dimensions/card-face-attributes-dimensions.component';
import { CardFaceAttributesIdComponent } from '../card-face-attributes-id/card-face-attributes-id.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
@Component({
  selector: 'app-card-editor-controls-card-face-attributes',
  imports: [CardFaceAttributesIdComponent, CardFaceAttributesBorderRadiusComponent, CardFaceAttributesDimensionsComponent, ColorPickerComponent, FormsModule, CardFaceAttributesBorderWidthComponent],
  templateUrl: './card-editor-controls-card-face-attributes.component.html',
  styleUrl: './card-editor-controls-card-face-attributes.component.css'
})
export class CardEditorControlsCardFaceAttributesComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

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

  get cardFaceHexcode() {
    return this.cardEditorControlsDesignCardFaceAttributesService.cardFaceHexcode;
  }

  set cardFaceHexcode(hexcode: string) {
    if (this.cardFaceHexcode !== hexcode) {
      this.cardEditorControlsDesignCardFaceAttributesService.cardFaceHexcode = hexcode;

      this.cardEditorControlsDesignCardFaceAttributesService.setOnFaceColorChange(this.cardFaceHexcode);
    }
  }

   get cardFaceHexInput(): string {
    return this.cardEditorControlsDesignCardFaceAttributesService.cardFaceHexInput;
  }

  set cardFaceHexInput(hexcode: string) {
    this.cardEditorControlsDesignCardFaceAttributesService.cardFaceHexInput = hexcode;
  }

  get borderHexcode() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderHexcode;
  }

  set borderHexcode(hexcode: string) {
    if (this.borderHexcode !== hexcode) {
      this.cardEditorControlsDesignCardFaceAttributesService.borderHexcode = hexcode;

      this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderColorChange(this.borderHexcode);
    }
  }

  get borderHexInput(): string {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderHexInput;
  }

  set borderHexInput(hexcode: string) {
    this.cardEditorControlsDesignCardFaceAttributesService.borderHexInput = hexcode;
  }
}
