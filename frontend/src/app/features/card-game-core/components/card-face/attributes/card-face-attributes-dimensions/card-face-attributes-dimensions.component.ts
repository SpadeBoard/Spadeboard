import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../../../services/card-game-core/card-editor/controls/design/card-face/card-editor-controls-design-card-face-attributes.service';
import { MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../../../utils/card-editor.constants';
import { clamp } from '../../../../../../utils/utils';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card-face-attributes-dimensions',
  imports: [FormsModule],
  templateUrl: './card-face-attributes-dimensions.component.html',
  styleUrl: './card-face-attributes-dimensions.component.scss'
})
export class CardFaceAttributesDimensionsComponent {
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

  // Use to set the values properly in the inputs
  @ViewChild('widthInput') widthRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heightInput') heightRef!: ElementRef<HTMLInputElement>;

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

  get height(): number {
    return this.cardEditorControlsDesignCardFaceAttributesService.cardFaceDimensions.height;
  }

  get width(): number {
    return this.cardEditorControlsDesignCardFaceAttributesService.cardFaceDimensions.width;
  }

  set height(height: number) {
    // https://stackoverflow.com/a/63300675
    height = clamp(height, MIN_CARD_FACE_HEIGHT, MAX_CARD_FACE_HEIGHT);

    this.cardEditorControlsDesignCardFaceAttributesService.cardFaceDimensions.height = height;
    this.cardEditorControlsDesignCardFaceAttributesService.setHeight(height);

    if (this.heightRef.nativeElement) this.heightRef.nativeElement.value = `${height}`;
  }

  set width(width: number) {
    width = clamp(width, MIN_CARD_FACE_WIDTH, MAX_CARD_FACE_WIDTH);

    this.cardEditorControlsDesignCardFaceAttributesService.cardFaceDimensions.width = width;
    this.cardEditorControlsDesignCardFaceAttributesService.setWidth(width);

    if (this.widthRef.nativeElement) this.widthRef.nativeElement.value = `${width}`;
  }
}
