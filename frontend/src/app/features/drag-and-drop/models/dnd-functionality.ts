import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove } from '@angular/cdk/drag-drop';
export interface DndFunctionality {
    onDragMove: (event: CdkDragMove<any>) => void,
    onDragEntered: (event: CdkDragEnter<any>) => void,
    onDragExited: (event: CdkDragExit<any>) => void,
    onDragDrop: (event: CdkDragDrop<any>) => void
}