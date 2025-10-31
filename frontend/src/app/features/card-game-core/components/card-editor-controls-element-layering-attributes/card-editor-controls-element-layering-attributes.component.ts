import { Component, inject } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { moveToBack, moveToFront } from '../../../../utils/utils';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/attributes/card-editor-controls-design-element-attributes.service';
import { CardFaceElementPerCardFace } from '../../models/card-face-element';
import { CardEditorControlsElementLayeringAttributesService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/attributes/card-editor-controls-element-layering-attributes.service';

@Component({
  selector: 'app-card-editor-controls-element-layering-attributes',
  imports: [],
  templateUrl: './card-editor-controls-element-layering-attributes.component.html',
  styleUrl: './card-editor-controls-element-layering-attributes.component.scss'
})
export class CardEditorControlsElementLayeringAttributesComponent {
  private readonly cardEditorControlsElementLayeringAttributesService: CardEditorControlsElementLayeringAttributesService = inject(CardEditorControlsElementLayeringAttributesService);

  onBringToFront(event: Event) {
    this.cardEditorControlsElementLayeringAttributesService.setOnBringToFront();
  }
  
  onSendToBack(event: Event) {
    this.cardEditorControlsElementLayeringAttributesService.setOnSendToBack();
  }
}
