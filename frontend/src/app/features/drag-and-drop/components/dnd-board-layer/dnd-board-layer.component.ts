import { Component, ElementRef, inject, ViewChild } from '@angular/core';

import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { Dimensions, stringify } from '../../../../utils/utils';
@Component({
  selector: 'app-dnd-board-layer',
  imports: [],
  templateUrl: './dnd-board-layer.component.html',
  styleUrl: './dnd-board-layer.component.scss'
})
export class DndBoardLayerComponent {
  private readonly dndBoardService: DndBoardService = inject(DndBoardService);

  @ViewChild('camera') camera!: ElementRef<HTMLDivElement>;

  viewport!: Dimensions;

  public ngOnInit(): void {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.getViewportTransform();

    this.onUpdateCamera();
    this.onMouseMove();
    this.setZoomLevel();
  }

  private onMouseMove(): void {
    this.dndBoardService.onMouseMove$.subscribe((result: { mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number }) => {
      let mouseMoveLog: string = `this.dndBoardService.onMouseMove$ (time: ${Date.now().toLocaleString("en-US")}):
        \nMouse Screen coordinates (clientX, clientY): (${result.mouseScreenX}, ${result.mouseScreenY})
        \nMouse relative to board (mouseX, mouseY): (${result.mouseX}, ${result.mouseY})
        \nMouse AU coordinates: (${stringify(this.dndBoardService.mouseAUCoordinates)})
        \nMouse AU to Screen coordinates: (${stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.mouseAUCoordinates))})
        \nCamera coordinates AU: (${stringify(this.dndBoardService.getCameraCoordinates())})
        \nGrid size AU: ${this.dndBoardService.getGridSizeAU()}
        \nViewport size: (${stringify(this.viewport)})
        \nZoom Level: ${this.dndBoardService.zoom}`;

      // console.log(`%c${this.constructor.name} - ${this.onMouseMove.name}:\n${mouseMoveLog}`, `color: #5448c8; background: #fffecb; padding: 5px; border-radius: 5px;`);
    })
  }

  protected getViewportTransform(): string {
    let camera = this.dndBoardService.getCameraCoordinates();
    let cellSize = this.dndBoardService.getScaledCellSize();
    return `translate(${camera.x * cellSize}px, ${camera.y * cellSize}px)`;
  }

  private onUpdateCamera(): void {
    this.dndBoardService.onUpdateCamera$.subscribe(() => {
      this.updateGridSize();
    })
  }

  private setZoomLevel(): void {
    this.dndBoardService.zoomLevel$.subscribe((zoomLevel: number) => {
      this.updateGridSize();
    })
  }

  private updateGridSize(): void {
    this.viewport = this.dndBoardService.getViewportDimensions();

    this.getViewportTransform();
    // console.log(`On update Card Position Per Room Grid Size: Viewport size: ${this.viewportWidth}, ${this.viewportHeight}, Zoom Level: ${this.dndBoardService.zoom}`);
  }
}
