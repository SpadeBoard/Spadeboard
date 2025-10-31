import { Component, inject, input, InputSignal } from '@angular/core';
import { Dimensions, stringify } from '../../../../utils/utils';
import { DndBoardService } from '../../services/dnd-board.service';

@Component({
  selector: 'app-dnd-board-grid',
  imports: [],
  templateUrl: './dnd-board-grid.component.html',
  styleUrl: './dnd-board-grid.component.scss'
})
export class DndBoardGridComponent {
  private readonly dndBoardService: DndBoardService= inject(DndBoardService);

  protected gridDimensions: Dimensions = {
    width: 0,
    height: 0
  }

  protected cellSizeScreen: number = 0;

  public readonly $shouldSnapToGrid: InputSignal<boolean> = input<boolean>(false);

  public readonly $snappedToGridColor: InputSignal<string> = input<string>('#4D8A98');
  public readonly $freeMovementColor: InputSignal<string> = input<string>('rgb(203 213 225)');

  constructor() {
    this.updateGridSize();

    // console.log(`Grid size: ${this.gridWidthScreen}, ${this.gridHeightScreen}`);
  }

  public ngOnInit(): void {
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
      let mouseMoveLog: string = `this.dndBoardService.onMouseMove$ (time: ${Date.now().toLocaleString("en-US")}):
      \nMouse coordinates relative to viewport (clientX, clientY): (${result.mouseScreenX}, ${result.mouseScreenY})
      \nMouse relative to board (mouseX, mouseY): (${result.mouseX}, ${result.mouseY})
      \nMouse AU coordinates: (${stringify(this.dndBoardService.mouseAUCoordinates)})
      \nMouse AU to Screen coordinates - relative to board: (${stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.mouseAUCoordinates))})
      \nViewport dimensions: (${stringify(this.dndBoardService.getViewportDimensions())})
      \nGrid size AU: ${this.dndBoardService.getGridSizeAU()}
      \nGrid size screen: (${stringify(this.gridDimensions)})
      \nCamera coordinates AU: (${stringify(this.dndBoardService.getCameraCoordinates())})
      \nZoom Level: ${this.dndBoardService.zoom}
      \nCell size screen: ${this.cellSizeScreen}`;

      // console.log(`%c${this.constructor.name} - ${this.onMouseMove.name}:\n${mouseMoveLog}`, `color: #052349; background: #e7f0ff; padding: 5px; border-radius: 5px;`);
    })
  }

  private updateGridSize(): void {
    // Dynamically update the background-size of the grid
    this.cellSizeScreen = this.dndBoardService.getScaledCellSize(); // Base cell size (50px) scaled by zoom
    
    this.gridDimensions = {
      width: this.dndBoardService.getScaledDndBoardSizeScreen(),
      height: this.dndBoardService.getScaledDndBoardSizeScreen()
    }

    // console.log(`On update Grid Size: Grid size screen: ${this.gridWidthScreen}, ${this.gridHeightScreen}, Zoom Level: ${this.dndBoardService.zoom}, Cell Size: ${this.cellSizeScreen}`);
  }

  protected getGridCellOutline(): string {
    let color: string = this.$shouldSnapToGrid() ? this.$snappedToGridColor() : this.$freeMovementColor();

    return `linear-gradient(to right, ${color} 1px, transparent 1px),
      linear-gradient(to bottom, ${color} 1px, transparent 1px)`;
  }
}
