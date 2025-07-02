import { Component, computed, inject, Signal } from '@angular/core';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID } from '../../utils/card-editor.constants';
import { CardEditorControlsElementLayeringAttributesComponent } from '../card-editor-controls-element-layering-attributes/card-editor-controls-element-layering-attributes.component';
import { CardFaceElementAttributesDimensionsComponent } from '../card-face-element-attributes-dimensions/card-face-element-attributes-dimensions.component';
import { CardFaceElementAttributesPositionComponent } from '../card-face-element-attributes-position/card-face-element-attributes-position.component';

@Component({
  selector: 'app-card-editor-controls-element-attributes',
  imports: [CardFaceElementAttributesDimensionsComponent, CardFaceElementAttributesPositionComponent, CardEditorControlsElementLayeringAttributesComponent],
  templateUrl: './card-editor-controls-element-attributes.component.html',
  styleUrl: './card-editor-controls-element-attributes.component.scss'
})
export class CardEditorControlsElementAttributesComponent {
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  id: Signal<string> = computed(() => this.cardEditorControlsDesignElementAttributesService.currentCardFaceElementId() ?? DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

  constructor() {
  }
}
