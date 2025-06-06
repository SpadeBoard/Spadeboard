import { Component, computed, inject, Signal } from '@angular/core';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';

@Component({
  selector: 'app-card-face-attributes-id',
  imports: [],
  templateUrl: './card-face-attributes-id.component.html',
  styleUrl: './card-face-attributes-id.component.css'
})
export class CardFaceAttributesIdComponent {
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

  id: Signal<string> = computed(() => this.cardEditorControlsDesignCardFaceAttributesService.cardFaceId());
}
