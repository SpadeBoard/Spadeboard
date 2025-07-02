import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { DndBoardService } from '../../services/dnd-board.service';
import { Dimensions } from '../../../../utils/utils';

@Component({
  selector: 'app-dnd-board-grid',
  imports: [],
  templateUrl: './dnd-board-grid.component.html',
  styleUrl: './dnd-board-grid.component.scss'
})
export class DndBoardGridComponent {
  private dndBoardService: DndBoardService= inject(DndBoardService);

  gridDimensions: Dimensions = {
    width: 0,
    height: 0
  }

  cellSizeScreen: number = 0;

  shouldSnapToGrid: InputSignal<boolean> = input(false);
  shouldSnapToGridComputed: Signal<boolean> = computed(() => this.shouldSnapToGrid());

  constructor() {
    this.updateGridSize();

    // console.log(`Grid size: ${this.gridWidthScreen}, ${this.gridHeightScreen}`);
  }

  ngOnInit() {
    this.onMouseMove();
    this.onZoomLevel();
  }

  private onZoomLevel(): void {
    this.dndBoardService.zoomLevel$.subscribe((zoomLevel: number) => {     
      this.updateGridSize();
    })
  }

  private onMouseMove(): void {
    this.dndBoardService.onMouseMove$.subscribe((result: {mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number}) => {
      let mouseMoveLog = `Grid - On Mouse Move:
      Mouse coordinates relative to viewport (clientX, clientY): (${result.mouseScreenX}, ${result.mouseScreenY})
      Mouse relative to board (mouseX, mouseY): (${result.mouseX}, ${result.mouseY})
      Mouse AU coordinates: (${JSON.stringify(this.dndBoardService.mouseAUCoordinates)})
      Mouse AU to Screen coordinates - relative to board: (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.mouseAUCoordinates))})
      Viewport dimensions: (${JSON.stringify(this.dndBoardService.getViewportDimensions())})
      Grid size AU: ${this.dndBoardService.getGridSizeAU()}
      Grid size screen: (${JSON.stringify(this.gridDimensions)})
      Camera coordinates AU: (${JSON.stringify(this.dndBoardService.getCameraCoordinates())})
      Zoom Level: ${this.dndBoardService.zoom}
      Cell size screen: ${this.cellSizeScreen}`;

      // 3. Log everything
      // console.log(mouseMoveLog);
    })
  }

  private updateGridSize() {
    // Dynamically update the background-size of the grid
    this.cellSizeScreen = this.dndBoardService.getScaledCellSize(); // Base cell size (50px) scaled by zoom
    
    this.gridDimensions = {
      width: this.dndBoardService.getScaledDndBoardSizeScreen(),
      height: this.dndBoardService.getScaledDndBoardSizeScreen()
    }

    // console.log(`On update Grid Size: Grid size screen: ${this.gridWidthScreen}, ${this.gridHeightScreen}, Zoom Level: ${this.dndBoardService.zoom}, Cell Size: ${this.cellSizeScreen}`);
  }

  getGridCellOutline(): string {
    let color: string = this.shouldSnapToGridComputed() ? '#4D8A98' : 'rgb(203 213 225)';

    return `linear-gradient(to right, ${color} 1px, transparent 1px),
      linear-gradient(to bottom, ${color} 1px, transparent 1px)`;
  }
}
