import { Component, computed, inject, Signal } from '@angular/core';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../../../services/card-game-core/card-editor/controls/design/card-face/card-editor-controls-design-card-face-attributes.service';

@Component({
  selector: 'app-card-face-attributes-id',
  imports: [],
  templateUrl: './card-face-attributes-id.component.html',
  styleUrl: './card-face-attributes-id.component.scss'
})
export class CardFaceAttributesIdComponent {
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

  protected id: Signal<string> = computed(() => this.cardEditorControlsDesignCardFaceAttributesService.cardFaceId());
}
