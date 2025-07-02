import { Component } from '@angular/core';
import { CardEditorControlsCardFaceElementsListComponent } from '../card-editor-controls-card-face-elements-list/card-editor-controls-card-face-elements-list.component';
import { CardEditorControlsElementAttributesComponent } from '../card-editor-controls-element-attributes/card-editor-controls-element-attributes.component';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';
import { CardEditorControlsDesignCardsTemplateContainerComponent } from '../card-editor-controls-design-cards-template-container/card-editor-controls-design-cards-template-container.component';
import { CardEditorControlsCardFaceAttributesComponent } from '../card-editor-controls-card-face-attributes/card-editor-controls-card-face-attributes.component';

@Component({
  selector: 'app-card-editor-controls-design',
  imports: [CardEditorControlsDesignCardsTemplateContainerComponent, CardEditorControlsCardFaceElementsListComponent, CardFaceRteComponent, CardEditorControlsElementAttributesComponent, CardEditorControlsCardFaceAttributesComponent],
  templateUrl: './card-editor-controls-design.component.html',
  styleUrl: './card-editor-controls-design.component.scss'
})
export class CardEditorControlsDesignComponent {
}
