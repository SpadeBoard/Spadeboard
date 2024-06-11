import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove } from '@angular/cdk/drag-drop';
import { Directive, output } from '@angular/core';
import { Style } from '../../style/models/style';

@Directive({
  selector: '[appDndContent]'
})
export class DndContentDirective {

  constructor() { }
  // CHECKME: Are the selectors correct? in how they're used in the HTML?
  // TODO: Make the style be two way binding for the resizability
  style = output<Style>();

  isDraggable = output<boolean>();
  isDroppable = output<boolean>();

  dragData = output<any>();
  
  customDrop = output<CdkDragDrop<any>>();
  customDrag = output<CdkDragMove<any>>();
  customDragEntered = output<CdkDragEnter<any>>();
  customDragExited = output<CdkDragExit<any>>();
}
