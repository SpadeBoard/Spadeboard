import { Component, input, output } from '@angular/core';
import { DndContentDirective } from '../../directives/dnd-content.directive';
import { Style } from '../../../style/models/style';

@Component({
  selector: 'app-dnd-resizable-container',
  imports: [
    DndContentDirective
  ],
  templateUrl: './dnd-resizable-container.component.html',
  styleUrl: './dnd-resizable-container.component.scss'
})
export class DndResizableContainerComponent {
  style = input<Style>({
    styleId: "0"
  });

  isDraggable = input<boolean>(true);
  isDroppable = input<boolean>(true);

  // TODO: Use these as a translation layer to pass back up to the DndBoardService, pass up the model, etc.
  dragData =  output<any>();
  customDrop = output<any>();
  customDragEntered = output<any>();
  customDrag = output<any>();
  customDragExited = output<any>();
}
