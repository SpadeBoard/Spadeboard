import { Component } from '@angular/core';
import { CardEditorControlsCardFaceElementsListComponent } from '../card-editor-controls-card-face-elements-list/card-editor-controls-card-face-elements-list.component';
import { CardEditorControlsElementAttributesComponent } from '../card-editor-controls-element-attributes/card-editor-controls-element-attributes.component';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';

@Component({
  selector: 'app-card-editor-controls-design',
  imports: [CardEditorControlsCardFaceElementsListComponent, CardFaceRteComponent, CardEditorControlsElementAttributesComponent],
  templateUrl: './card-editor-controls-design.component.html',
  styleUrl: './card-editor-controls-design.component.css'
})
export class CardEditorControlsDesignComponent {

}
