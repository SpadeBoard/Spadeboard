import { Component, computed, HostListener, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { clamp, Dimensions, Threshold } from '../../../../utils/utils';

@Component({
  selector: 'app-resizable-wrapper',
  imports: [],
  templateUrl: './resizable-wrapper.component.html',
  styleUrl: './resizable-wrapper.component.scss'
})
export class ResizableWrapperComponent {
  public readonly $dimensions: InputSignal<Dimensions> = input<Dimensions>({
    width: 0.01,
    height:0.01
  });

  public readonly $resizeThreshold: InputSignal<Threshold> = input<Threshold>({
    min: 0.01,
    max: 400
  });

  private readonly $clampedDimensionsComputed: Signal<Dimensions> = computed(() => {
    let value: Dimensions = this.$dimensions();

    value = {
      width: (value.width > 0) ? value.width : this.$resizeThreshold().min,
      height: (value.height) > 0 ? value.height : this.$resizeThreshold().min
    }

    return value;
  });

  public readonly $resizableChange: OutputEmitterRef<Dimensions> = output<Dimensions>();

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

  private topLeftResize(offsetX: number, offsetY: number): void {
    let current: Dimensions = this.$clampedDimensionsComputed();
    let newWidth: number = clamp(current.width - offsetX, this.$resizeThreshold().min, this.$resizeThreshold().max);
    let newHeight: number = clamp(current.height - offsetY, this.$resizeThreshold().min, this.$resizeThreshold().max);

    this.$resizableChange.emit({ width: newWidth, height: newHeight });
  }

  private topRightResize(offsetX: number, offsetY: number): void {
    let current: Dimensions = this.$clampedDimensionsComputed();
    let newWidth: number = clamp(current.width + offsetX, this.$resizeThreshold().min, this.$resizeThreshold().max);
    let newHeight: number = clamp(current.height - offsetY, this.$resizeThreshold().min, this.$resizeThreshold().max);

    this.$resizableChange.emit({ width: newWidth, height: newHeight });
  }

  private bottomLeftResize(offsetX: number, offsetY: number): void {
    let current: Dimensions = this.$clampedDimensionsComputed();
    let newWidth: number = clamp(current.width - offsetX, this.$resizeThreshold().min, this.$resizeThreshold().max);
    let newHeight : number= clamp(current.height + offsetY, this.$resizeThreshold().min, this.$resizeThreshold().max);

    this.$resizableChange.emit({ width: newWidth, height: newHeight });
  }

  private bottomRightResize(offsetX: number, offsetY: number): void {
    let current: Dimensions = this.$clampedDimensionsComputed();
    let newWidth: number = clamp(current.width + offsetX, this.$resizeThreshold().min, this.$resizeThreshold().max);
    let newHeight: number = clamp(current.height + offsetY, this.$resizeThreshold().min, this.$resizeThreshold().max);

    this.$resizableChange.emit({ width: newWidth, height: newHeight });
  }

  protected onCornerClick(event: MouseEvent, corner: string): void {
    this.draggingAttributes.draggingCorner = true;

    this.draggingAttributes.px = event.clientX;
    this.draggingAttributes.py = event.clientY;

    this.draggingAttributes.corner = corner;

    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  protected onCornerMove(event: MouseEvent): void {
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
  protected onCornerRelease(event: MouseEvent): void {
    this.draggingAttributes.draggingWindow = false;
    this.draggingAttributes.draggingCorner = false;
  }
}
