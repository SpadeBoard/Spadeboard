import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { DndPosition } from '../../../../drag-and-drop/models/dnd-position';

@Component({
  selector: 'app-card-face-elements-library',
  imports: [CdkDrag, DragDropModule],
  templateUrl: './card-face-elements-library.component.html',
  styleUrl: './card-face-elements-library.component.scss'
})
export class CardFaceElementsLibraryComponent {
  public readonly $isCardFaceElementsLibraryDisabled: InputSignal<boolean> = input<boolean>(false);

  public readonly $createdCardFaceElementPerCardFace: OutputEmitterRef<{
    type: string,
    dndPosition: DndPosition
  }> = output<{
    type: string,
    dndPosition: DndPosition
  }>();

  protected onDragDropped(event: CdkDragDrop<any>): void {
    // FIXME: We need to check to see whether it's on the actual card otherwise we shouldn't add that element
    if (!event.isPointerOverContainer) {
      let type: string = event.item.data;

      let dndPosition: DndPosition = {
        dndPositionId: "0",
        x: event.dropPoint.x,
        y: event.dropPoint.y
      }

      this.$createdCardFaceElementPerCardFace.emit({type, dndPosition});
    }
  }

  protected getDisabledAesthetics(): number {
    return (this.$isCardFaceElementsLibraryDisabled()) ? 0.5 : 1;
  }
}
