import { Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { Style } from '../../../style/models/style';

@Component({
  selector: 'app-resizable-wrapper',
  imports: [],
  templateUrl: './resizable-wrapper.component.html',
  styleUrl: './resizable-wrapper.component.css'
})
export class ResizableWrapperComponent {
  // CHECKME: isResizable should be in here?
  isResizable = input<boolean>(false);

  parentWidth = input<number>(0);
  parentHeight = input<number>(0);

  parentDimensionsChange = output<{x: number, y: number}>();

  private _parentStartWidth: number = 0;
  private _parentStartHeight: number = 0;

  private _mouseClientX: number = 0;
  private _mouseClientY: number = 0;
  private _newParentWidth: number = 0;
  private _newParentHeight: number = 0;

  // Relative: Imagine you have a sticky note on a wall. You can slide the sticky note up, down, left, or right, but the wall still remembers where it originally was.
  getStyle(): Omit<Style, 'styleId'> {
    return {
      // styleId: 0,
      position: 'absolute', // KEEP THE ARROWS ABSOLUTE SO THEY CAN ALWAYS BE AT CORNER
      width: `${this.parentWidth}px`,
      height: `${this.parentHeight}px`
    }
  }

  // Triggered when resizing starts
  onResizeStart(event: MouseEvent): void {
    // Save initial dimensions and mouse position
    this._parentStartWidth = this.parentWidth();
    this._parentStartHeight = this.parentHeight();

    this. _mouseClientX = event.clientX;
    this._mouseClientY = event.clientY;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    event.preventDefault();
  }

  // CHECKME: Would this implode, would it recognize the parent width is always changing?
  onMouseMove(moveEvent: MouseEvent): void {
    if (this.isResizable()) {
      // CHECKME
      this._newParentWidth = this._parentStartWidth+ (moveEvent.clientX - this. _mouseClientX);
      this._newParentHeight= this._parentStartHeight+ (moveEvent.clientY - this._mouseClientY);

      // Signal up to parent component to apply new width and height
      this.parentDimensionsChange.emit({x: this._newParentWidth, y: this._newParentHeight});
    }
  };

  onMouseUp(): void {
    if (!this.isResizable()) return;

    // Remove event listeners when isResizableis complete
    document.removeEventListener('mousemove', (e) => this.onMouseMove(e, null!));
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}
