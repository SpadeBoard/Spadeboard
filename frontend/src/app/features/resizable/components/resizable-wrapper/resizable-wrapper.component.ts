import { Component, computed, effect, ElementRef, HostListener, input, InputSignal, output, OutputEmitterRef, Signal, ViewChild } from '@angular/core';
import { Style } from '../../../style/models/style';
import { clamp } from '../../../../utils/utils';

@Component({
  selector: 'app-resizable-wrapper',
  imports: [],
  templateUrl: './resizable-wrapper.component.html',
  styleUrl: './resizable-wrapper.component.css'
})
export class ResizableWrapperComponent {
  // CHECKME: isResizable should be in here?
  /*isResizable = input<boolean>(false);

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
      // styleId: "0",
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
  };*/

  // https://dev.to/zchtodd/creating-a-resizable-draggable-component-in-angular2-9cl
  // TODO: Refactor this functionality into its own component eventually or service?
  

  dimensions: InputSignal<{ width: number, height: number }> = input<{ width: number, height: number }>({
    width: 0.01,
    height: 0.01
  });

  private dimensionsComputed: Signal<{
    width: number;
    height: number;
  }> = computed(() => {
    let value = this.dimensions();

    value = {
      width: (value.width > 0) ? value.width : 0.01,
      height: (value.height) > 0 ? value.height : 0.01
    }

    return value;
  });

  resizableChange: OutputEmitterRef<{
    width: number;
    height: number;
  }> = output<{
    width: number;
    height: number;
  }>();

  private draggingAttributes: {
    draggingWindow: boolean;
    draggingCorner: boolean;
    x: number;
    y: number;
    px: number;
    py: number;
    resizer: Function | undefined;
    corner: string;
  } = {
      draggingWindow: false,
      draggingCorner: false,
      x: 300,
      y: 100,
      px: 0,
      py: 0,
      resizer: undefined,
      corner: ""
    }

  constructor() {
  }


  bottomRightResize(offsetX: number, offsetY: number) {
    let current = this.dimensionsComputed();
    let newWidth = clamp(current.width + offsetX, 0.01, 400);
    let newHeight = clamp(current.height + offsetY, 0.01, 400);

    this.resizableChange.emit({ width: newWidth, height: newHeight });
  }

  onCornerClick(event: MouseEvent, corner: string) {
    this.draggingAttributes.draggingCorner = true;

    this.draggingAttributes.px = event.clientX;
    this.draggingAttributes.py = event.clientY;

    this.draggingAttributes.corner = corner;

    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  onCornerMove(event: MouseEvent) {
    if (!this.draggingAttributes.draggingCorner) {
      return;
    }
    let offsetX = event.clientX - this.draggingAttributes.px;
    let offsetY = event.clientY - this.draggingAttributes.py;

    let corner = this.draggingAttributes.corner;

    if (corner === "bottom-right") {
      this.bottomRightResize(offsetX, offsetY);
    }

    this.draggingAttributes.px = event.clientX;
    this.draggingAttributes.py = event.clientY;
  }

  @HostListener('document:mouseup', ['$event'])
  onCornerRelease(event: MouseEvent) {
    this.draggingAttributes.draggingWindow = false;
    this.draggingAttributes.draggingCorner = false;
  }
}
