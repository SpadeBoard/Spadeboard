import { Component, ElementRef, inject, ViewChild } from '@angular/core';

import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
@Component({
  selector: 'app-dnd-board-layer',
  imports: [],
  templateUrl: './dnd-board-layer.component.html',
  styleUrl: './dnd-board-layer.component.css'
})
export class DndBoardLayerComponent {
  private dndBoardService: DndBoardService = inject(DndBoardService);

  @ViewChild('camera') camera!: ElementRef<HTMLDivElement>;

  viewportWidth!: number;
  viewportHeight!: number;

  viewportLeft!: number;
  viewportTop!: number;

  ngOnInit() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;

    this.getViewportTransform();

    this.onUpdateCamera();
    this.onMouseMove();
    this.setZoomLevel();
  }

  private onMouseMove(): void {
    this.dndBoardService.onMouseMove$.subscribe((result: { mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number }) => {
      let mouseMoveLog = `Card position per room - On Mouse Move:
        Mouse Screen coordinates (clientX, clientY): (${result.mouseScreenX}, ${result.mouseScreenY})
        Mouse relative to board (mouseX, mouseY): (${result.mouseX}, ${result.mouseY})
        Mouse AU coordinates: (${JSON.stringify(this.dndBoardService.mouseAUCoordinates)})
        Mouse AU to Screen coordinates: (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.mouseAUCoordinates))})
        Camera coordinates AU: (${JSON.stringify(this.dndBoardService.getCameraCoordinates())})
        Grid size AU: ${this.dndBoardService.getGridSizeAU()}
        Viewport size: (${this.viewportWidth}, ${this.viewportHeight})
        Zoom Level: ${this.dndBoardService.zoom}`;

      // 3. Log everything
      // console.log(mouseMoveLog);
    })
  }

  getViewportTransform() {
    let camera = this.dndBoardService.getCameraCoordinates();
    let cellSize = this.dndBoardService.getScaledCellSize();
    return `translate(${camera.x * cellSize}px, ${camera.y * cellSize}px)`;
  }

  private onUpdateCamera() {
    this.dndBoardService.onUpdateCamera$.subscribe(() => {
      this.updateGridSize();
    })
  }

  private setZoomLevel(): void {
    this.dndBoardService.zoomLevel$.subscribe((zoomLevel: number) => {
      this.updateGridSize();
    })
  }

  private updateGridSize() {
    let getViewportDimensions = this.dndBoardService.getViewportDimensions();

    this.viewportWidth = getViewportDimensions.width;
    this.viewportHeight = getViewportDimensions.height;

    this.getViewportTransform();
    // console.log(`On update Card Position Per Room Grid Size: Viewport size: ${this.viewportWidth}, ${this.viewportHeight}, Zoom Level: ${this.dndBoardService.zoom}`);
  }
}
