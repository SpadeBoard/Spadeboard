import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { MAX_CURRENT_ELEMENTS_PER_CARD_FACE } from '../../utils/card-editor.constants';

@Component({
  selector: 'app-card-editor-controls-card-face-elements-list',
  imports: [CdkDrag, DragDropModule],
  templateUrl: './card-editor-controls-card-face-elements-list.component.html',
  styleUrl: './card-editor-controls-card-face-elements-list.component.css'
})
export class CardEditorControlsCardFaceElementsListComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  onDragDropped(event: CdkDragDrop<any>) {
    if (!event.isPointerOverContainer) {
      let type: string = event.item.data;
      
      let dndPosition: DndPosition = {
        dndPositionId: "0",
        x: event.dropPoint.x,
        y: event.dropPoint.y
      }

      this.cardEditorPreviewService.setOnCreateCardFaceElementPerCardFace(type, dndPosition);
      this.getDisabledAesthetics();
    }
  }

  getDisabledAesthetics(): number {
    return (this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFaceAmt() >= MAX_CURRENT_ELEMENTS_PER_CARD_FACE) ? 0.5 : 1;
  }
}
