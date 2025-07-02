import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';
import { clamp } from '../../../../utils/utils';
import { MAX_BORDER_RADIUS, MIN_BORDER_RADIUS } from '../../utils/card-editor.constants';
import { FormsModule } from '@angular/forms';

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
    borderRadius = clamp(borderRadius, MIN_BORDER_RADIUS, MAX_BORDER_RADIUS);

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
