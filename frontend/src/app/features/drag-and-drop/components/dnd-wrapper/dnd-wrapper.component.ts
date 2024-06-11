import { Component, computed, input, InputSignal, output, Signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, CdkDropList } from '@angular/cdk/drag-drop';
import { isDndItem } from '../../utils/dnd-item.utils';
import { Style } from '../../../style/models/style';
import { DndDragBoundary } from '../../models/dnd-types';

@Component({
  selector: 'app-dnd-wrapper',
  imports: [
    CdkDrag,
    CdkDropList
  ],
  templateUrl: './dnd-wrapper.component.html',
  styleUrl: './dnd-wrapper.component.css'
})

// TODO: Figure out how to use DndStyle
// EXAMPLE: Angular CDK stylling override
/*
Here's an example of how to use Angular CDK's drag and drop functionality with custom styling using a style object based on an interface:

```typescript
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface DragDropStyles {
  container?: Partial<CSSStyleDeclaration>;
  item?: Partial<CSSStyleDeclaration>;
  dragPreview?: Partial<CSSStyleDeclaration>;
}

@Component({
  selector: 'app-drag-drop-example',
  template: `
    <div cdkDropList [ngStyle]="styles.container" (cdkDropListDropped)="drop($event)">
      <div *ngFor="let item of items" cdkDrag [ngStyle]="styles.item">
        {{item}}
        <div class="custom-drag-preview" *cdkDragPreview [ngStyle]="styles.dragPreview">{{item}}</div>
      </div>
    </div>
  `
})
export class DragDropExampleComponent {
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  styles: DragDropStyles = {
    container: {
      width: '300px',
      border: '1px solid #ccc',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px'
    },
    item: {
      backgroundColor: '#f0f0f0',
      margin: '5px 0',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'move'
    },
    dragPreview: {
      backgroundColor: '#3f51b5',
      color: 'white',
      padding: '10px',
      borderRadius: '4px',
      boxShadow: '0 5px 5px -3px rgba(0,0,0,0.2)'
    }
  };

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
```

This example demonstrates:

1. Using `cdkDropList` and `cdkDrag` directives from Angular CDK.
2. Applying custom styles to the container, draggable items, and drag preview using `[ngStyle]`.
3. Defining a `DragDropStyles` interface to type-check the style object.
4. Implementing the `drop` method to handle reordering of items.

The `styles` object allows for easy customization of the drag and drop components' appearance. You can modify these styles dynamically in your component logic if needed[1][5].

Citations:
[1] https://pieces.app/blog/angular-material-cdk-with-drag-and-drop
[2] https://timdeschryver.dev/blog/exploring-drag-and-drop-with-the-new-angular-material-cdk
[3] https://javascript.plainenglish.io/beautiful-styling-for-drag-and-drop-rows-in-the-angular-datatable-6870768c5a8f?gi=32eadbdc7fa2
[4] https://dev.to/ngmaterialdev/angular-cdk-drag-drop-multi-direction-movement-54l5
[5] https://luixaviles.com/2021/11/angular-cdk-sorting-items-using-drag-and-drop/
[6] https://material.angular.io/cdk/drag-drop
[7] https://stackoverflow.com/questions/71183276/how-can-i-customize-the-style-in-cdk-draggable-mode
[8] https://github.com/angular/components/issues/20246
*/

// ASSUMPTIONS:
// Drag the handler, then whatever component that has the directive has its own functions for the @Output
// With cards and decks, they have those functions, which then will call the implemented functions of the same name in dndCardBoardService
// This is meant to wrap around the component that can be draggable and droppable and resizable
export class DndWrapperComponent {
  /*************************** DND *************************/
  // TODO: Combine the resizable editor with the dnd wrapper and have toggles for it and the draggability and droppability, probably rename this wrapper too
  // TODO: Potentially add a isResizable flag in the model?
 //  @ContentChild(DndContentDirective) dndContent: DndContentDirective;

    // ASSUMPTIONS: The directive and children set these
  // Set the parent's width and height here
  // TODO: Take these styling rules, and make a utility function out of these
  
  // TODO: Simplify this, if we're already passing in the drag data, why have these inputs
  private _parentWidth: number = 0;
  private _parentHeight: number = 0;

  private _isDraggable: boolean = true;
  private _isDroppable: boolean = true;

  dragData: InputSignal<any | undefined> = input<any>();
  readonly dragDataComputed: Signal<any> = computed(() => {
      if (!isDndItem(this.dragData()))
        return;
      
      // TODO: Set parent width, height, is draggable, etc.
      this._parentWidth = this.dragData().width;
      this._parentHeight = this.dragData().height;
      this._isDraggable = this.dragData()._isDraggable;
      this._isDroppable = this.dragData()._isDroppable;
    }
  );
  
  dragBoundary= input<DndDragBoundary>() ?? "";

  onDragMoveChange = output<CdkDragMove<any>>();
  onDragEnteredChange = output<CdkDragEnter<any>>();
  onDragDropChange = output<CdkDragDrop<any>>();
  onDragExitedChange = output<CdkDragExit<any>>();

  constructor() {}

  getIsDraggable(): boolean {
    return this._isDraggable;
  }

  getIsDroppable(): boolean {
    return this._isDroppable;
  }

  getStyle(): Omit<Style, 'styleId'> {
    return {
      styleId: 0,
      position: 'absolute', // KEEP THE ARROWS ABSOLUTE SO THEY CAN ALWAYS BE AT CORNER
      width: `${this._parentWidth}px`,
      height: `${this._parentHeight}px`
    }
  }

  onDragMove(event: CdkDragMove<any>) {
    // FIXME: Certain dnd components should have the ability to override this
    // event.preventDefault();

    // Call default drag behavior (handled internally by CdkDragMove). Extend or override with custom logic
    this.onDragMoveChange.emit(event);
  }

  onDragEntered(event: CdkDragEnter<any>) {
    // FIXME: Certain dnd components should have the ability to override this
    // event.preventDefault();

    // Call default drag behavior (handled internally by CdkDragMove). Extend or override with custom logic
      this.onDragEnteredChange.emit(event);
  }

  onDragDrop(event: CdkDragDrop<any>) {
    // FIXME: Certain dnd components should have the ability to override this
    // event.preventDefault();

    // TODO: Insert default functionality, like storing the positions?

    // Call default drop behavior (handled internally by CdkDropList). Extend or override with custom logic
    this.onDragDropChange.emit(event);
  }

  onDragExited(event: CdkDragExit<any>) {
    // FIXME: Certain dnd components should have the ability to override this
    // event.preventDefault();

    // Call default drop behavior (handled internally by CdkDropList). Extend or override with custom logic
    this.onDragExitedChange.emit(event);
  }
}
