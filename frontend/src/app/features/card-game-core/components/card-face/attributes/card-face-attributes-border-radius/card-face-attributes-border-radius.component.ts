import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../../../services/card-game-core/card-editor/controls/design/card-face/card-editor-controls-design-card-face-attributes.service';
import { MAX_BORDER_RADIUS, MIN_BORDER_RADIUS } from '../../../../utils/card-editor.constants';
import { clampBorderRadius } from '../../../../utils/card-face.constants';

@Component({
  selector: 'app-card-face-attributes-border-radius',
  imports: [FormsModule],
  templateUrl: './card-face-attributes-border-radius.component.html',
  styleUrl: './card-face-attributes-border-radius.component.scss'
})
export class CardFaceAttributesBorderRadiusComponent {
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

  @ViewChild('borderRadiusInput') borderRadiusRef!: ElementRef<HTMLInputElement>;

  get borderRadius() {
    return this.cardEditorControlsDesignCardFaceAttributesService.borderRadius;
  }

  set borderRadius(borderRadius: number) {
    borderRadius = clampBorderRadius(borderRadius);

    this.cardEditorControlsDesignCardFaceAttributesService.borderRadius = borderRadius;
    this.cardEditorControlsDesignCardFaceAttributesService.setOnBorderRadiusChange(borderRadius);

    if (this.borderRadiusRef.nativeElement) this.borderRadiusRef.nativeElement.value = `${borderRadius}`;
  }

  get minBorderRadius(): number {
    return MIN_BORDER_RADIUS;
  }

  get maxBorderRadius(): number {
    return MAX_BORDER_RADIUS;
  }
}
