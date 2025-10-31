import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardFaceElementService } from '../../services/card-game-core/card-face-element/card-face-element.service';

@Component({
  selector: 'app-card-editor-controls-card-face-elements-list',
  imports: [CdkDrag, DragDropModule],
  templateUrl: './card-editor-controls-card-face-elements-list.component.html',
  styleUrl: './card-editor-controls-card-face-elements-list.component.scss'
})
export class CardEditorControlsCardFaceElementsListComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardFaceElementService: CardFaceElementService = inject(CardFaceElementService);

  protected onDragDropped(event: CdkDragDrop<any>): void {
    if (!event.isPointerOverContainer) {
      let type: string = event.item.data;
      
      let dndPosition: DndPosition = {
        dndPositionId: "0",
        x: event.dropPoint.x,
        y: event.dropPoint.y
      }

      this.cardFaceElementService.createdCardFaceElementPerCardFace(type, dndPosition);
      this.getDisabledAesthetics();
    }
  }

  protected getDisabledAesthetics(): number {
    return (!this.cardFaceElementService.canAddCardFaceElementPerCardFace(this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace())) ? 0.5 : 1;
  }
}
