import { Component, computed, effect, ElementRef, HostListener, input, InputSignal, output, OutputEmitterRef, Signal, ViewChild } from '@angular/core';
import { Style } from '../../../style/models/style';
import { clamp, Dimensions, Threshold } from '../../../../utils/utils';

@Component({
  selector: 'app-resizable-wrapper',
  imports: [],
  templateUrl: './resizable-wrapper.component.html',
  styleUrl: './resizable-wrapper.component.scss'
})
export class ResizableWrapperComponent {
  dimensions: InputSignal<Dimensions> = input<Dimensions>({
    width: 0.01,
    height:0.01
  });

  // TODO: Just put this outside of here, we shouldn't clamp inside the wrapper, have the parent handle clamping
  resizeThreshold: InputSignal<Threshold> = input<Threshold>({
    min: 0.01,
    max: 400
  });

  resizeThresholdComputed: Signal<Threshold> = computed(
    () => this.resizeThreshold()
  );

  private dimensionsComputed: Signal<Dimensions> = computed(() => {
    let value = this.dimensions();

    value = {
      width: (value.width > 0) ? value.width : this.resizeThresholdComputed().min,
      height: (value.height) > 0 ? value.height : this.resizeThresholdComputed().min
    }

    return value;
  });

  resizableChange: OutputEmitterRef<Dimensions> = output<Dimensions>();

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

  topLeftResize(offsetX: number, offsetY: number) {
    let current = this.dimensionsComputed();
    let newWidth = clamp(current.width - offsetX, this.resizeThresholdComputed().min, this.resizeThresholdComputed().max);
    let newHeight = clamp(current.height - offsetY, this.resizeThresholdComputed().min, this.resizeThresholdComputed().max);

    this.resizableChange.emit({ width: newWidth, height: newHeight });
  }

  topRightResize(offsetX: number, offsetY: number) {
    let current = this.dimensionsComputed();
    let newWidth = clamp(current.width + offsetX, this.resizeThresholdComputed().min, this.resizeThresholdComputed().max);
    let newHeight = clamp(current.height - offsetY, this.resizeThresholdComputed().min, this.resizeThresholdComputed().max);

    this.resizableChange.emit({ width: newWidth, height: newHeight });
  }

  bottomLeftResize(offsetX: number, offsetY: number) {
    let current = this.dimensionsComputed();
    let newWidth = clamp(current.width - offsetX, this.resizeThresholdComputed().min, this.resizeThresholdComputed().max);
    let newHeight = clamp(current.height + offsetY, this.resizeThresholdComputed().min, this.resizeThresholdComputed().max);

    this.resizableChange.emit({ width: newWidth, height: newHeight });
  }

  bottomRightResize(offsetX: number, offsetY: number) {
    let current = this.dimensionsComputed();
    let newWidth = clamp(current.width + offsetX, this.resizeThresholdComputed().min, this.resizeThresholdComputed().max);
    let newHeight = clamp(current.height + offsetY, this.resizeThresholdComputed().min, this.resizeThresholdComputed().max);

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

    switch (corner) {
      case 'top-left':
        this.topLeftResize(offsetX, offsetY);
        break;
      case 'top-right':
        this.topRightResize(offsetX, offsetY);
        break;
      case 'bottom-left':
        this.bottomLeftResize(offsetX, offsetY);
        break;
      case 'bottom-right':
        this.bottomRightResize(offsetX, offsetY);
        break;
      default:
        throw new Error("No legitimate corner");
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
