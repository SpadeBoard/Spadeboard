import { Component, effect, ElementRef, inject, Injectable, input, ViewChild  } from '@angular/core';
import { CardPositionPerRoomApiService } from '../../services/card-game-core/card-position-per-room-api.service';
import { CardPositionPerRoom } from '../../models/card';
import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragStart, DragRef, Point} from '@angular/cdk/drag-drop';
import { CardComponent } from '../card/card.component';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { GameRoomService } from '../../../game-room/services/game-room.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { mergeMap } from 'rxjs';
import { snapToGridCellCentre, snapToGridNearestVertex } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { isCardPositionPerRoom } from '../../utils/card-game-core.utils';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';

@Component({
  selector: 'app-card-position-per-room',
  imports: [
    CdkDrag,
    CardComponent
  ],
  templateUrl: './card-position-per-room.component.html',
  styleUrl: './card-position-per-room.component.css'
})
export class CardPositionPerRoomComponent {
  private cardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  private cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private dndBoardService: DndBoardService = inject(DndBoardService);
  private gameRoomService: GameRoomService = inject(GameRoomService);

  @ViewChild('dndBoard') dndBoard!: ElementRef<HTMLDivElement>;
  
  cprs: CardPositionPerRoom[] = [];

  // NOTE: For rendering only
  unculledCprs: CardPositionPerRoom[] = [];

  private snapToGridPosition: {x: number, y: number} = {x: 0, y: 0};
  
  // TODO: Refactor the bloody architecture
  cardsZoomLevel: number = 1;
  
  viewportWidth!: number;
  viewportHeight!: number;
  
  viewportLeft!: number;
  viewportTop!: number;

  cellSizeScreen: number = 0;

  private dragOffset: { x: number; y: number; } = {x: 0, y: 0};

  constructor() {
   // this.updateGridSize();

    effect(() => {
      if (this.gameRoomService.currentGameRoomId() > 0) {
        this.getCardsPositionPerRoomByRoomId(this.gameRoomService.currentGameRoomId());
      }
    });
  }

  ngOnInit() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;

    this.getViewportTransform();

    this.createCardPositionPerRoom();
    this.updateCardPositionPerRoomOnSave();
    
    this.onUpdateCamera();
    this.onMouseMove();
    this.setCardsZoomLevel();
    this.setOnScreenCprs();
  }

  private onUpdateCamera() {
    this.dndBoardService.onUpdateCamera$.subscribe(() => {
      this.updateGridSize();
      this.setOnScreenCprs();
    })
  }


  // TODO: Make an observable that filters out all items not in camera viewport
  // Have a function to replace cprs and then render them
  private setOnScreenCprs(): void {
    if (this.cprs.length > 0) {
      this.unculledCprs = this.getOnScreenCprs(this.viewportWidth, this.viewportHeight);
      // console.log(`Card position per room set on screen CPRs: ${JSON.stringify(this.unculledCprs)}`);
    }
  }

  getOnScreenCprs(screenPxX: number, screenPxY: number) {
    return this.cprs.filter(cpr => this.dndBoardService.isPositionInCameraSpace(cpr.dndPosition.x, cpr.dndPosition.y, screenPxX, screenPxY) == true);
  }

  // NOTE: Assumes the dndPosition is in AU and set to the mouse AU coordinates
  calculateCardPositionPerRoomScreenPosition(dndPositionAU: DndPosition): {
    screenX: number;
    screenY: number;
  } {
    let cprScreenCoordinates = this.dndBoardService.aUToScreenCoordinates(dndPositionAU.x, dndPositionAU.y);

    // console.log(`Calculate CPR screen position - AU coordinates: ${JSON.stringify(dndPositionAU)}, Screen coordinates: ${JSON.stringify(cprScreenCoordinates)}`);

    return cprScreenCoordinates;
  }

  private onMouseMove(): void {
    this.dndBoardService.onMouseMove$.subscribe((result: {mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number}) => {
      let mouseMoveLog = `Card position per room - On Mouse Move:
      Mouse Screen coordinates (clientX, clientY): (${result.mouseScreenX}, ${result.mouseScreenY})
      Mouse relative to board (mouseX, mouseY): (${result.mouseX}, ${result.mouseY})
      Mouse AU coordinates: (${JSON.stringify(this.dndBoardService.getMouseAUCoordinates())})
      Mouse AU to Screen coordinates: (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.getMouseAUCoordinates().gridX, this.dndBoardService.getMouseAUCoordinates().gridY))})
      Camera coordinates AU: (${JSON.stringify(this.dndBoardService.getCameraCoordinates())})
      Grid size AU: ${this.dndBoardService.getGridSizeAU()}
      Viewport size: (${this.viewportWidth}, ${this.viewportHeight})
      Zoom Level: ${this.dndBoardService.zoom}`;

      // 3. Log everything
      // console.log(mouseMoveLog);
    })
  }

  // FIXME: Need to update the grid size everytime the screen gets resized.
  private updateGridSize() {
    this.cellSizeScreen = this.dndBoardService.getScaledCellSize();

    let getViewportDimensions = this.dndBoardService.getViewportDimensions();

    this.viewportWidth = getViewportDimensions.viewportWidthPx;
    this.viewportHeight = getViewportDimensions.viewportHeightPx;
    
    this.getViewportTransform();
    // console.log(`On update Card Position Per Room Grid Size: Viewport size: ${this.viewportWidth}, ${this.viewportHeight}, Zoom Level: ${this.dndBoardService.zoom}`);
  }

  // TODO: Refactor this into the dndBoardService
  getViewportTransform() {
    let camera = this.dndBoardService.getCameraCoordinates();
    let cellSize = this.dndBoardService.getScaledCellSize();
    return `translate(${camera.cameraX * cellSize}px, ${camera.cameraY * cellSize}px)`;
  }

  private setCardsZoomLevel(): void {
    this.dndBoardService.zoomLevel$.subscribe((zoomLevel: number) => {     
      this.updateGridSize();
      this.cardsZoomLevel = zoomLevel;
    })
  }
  
  // Reference: https://www.angularspace.com/creating-custom-rxresource-api-with-observables/
  private getCardsPositionPerRoomByRoomId(gameRoomId: number): void {
    this.cardPositionPerRoomApiService.getCardsPositionPerRoomByRoomId(
      gameRoomId).subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result !== undefined) {
          this.cprs = result;
          this.refreshUnculledCprs();
        }
    });
  }

  private findCardPositionPerRoom(cardId: number): CardPositionPerRoom | undefined{
    return this.cprs.find((cpr) => cpr.card.cardId == cardId);
  }

  // 50830.3 * 50 * 1 = 2,541,515
  private createCardPositionPerRoom() { 
    this.cardGameCoreService.cardPositionPerRoom$
    .pipe(
      mergeMap((cpr: CardPositionPerRoom) => {
        return this.cardPositionPerRoomApiService.createCardPositionPerRoom(cpr);
      })
    )
    .subscribe((result: CardPositionPerRoom | undefined) => {
      if (result !== undefined) {
        // console.log(`Create card position per room: ${JSON.stringify(result)}`);
        this.cprs.push(result);

        this.refreshUnculledCprs();
      }
    });
  }

  // TODO: Get the card via the ID as well as position
  // TODO: Create a new card position per room

  // TODO: Update to the backend based on idle period
  private updateCardPositionPerRoom(updatedCpr: CardPositionPerRoom) {
    let cprToReplace = this.findCardPositionPerRoom(updatedCpr.card.cardId);

    if (cprToReplace !== undefined) {
      Object.assign(cprToReplace, updatedCpr);

      // Force unculled refresh
      this.refreshUnculledCprs();
    }
  }
  
  private refreshUnculledCprs() {
    let dimensions = this.dndBoardService.getViewportDimensions();
    this.unculledCprs = this.getOnScreenCprs(dimensions.viewportWidthPx, dimensions.viewportHeightPx);
  }

  private updateCardPositionPerRoomOnSave() {
    this.gameRoomService.onSaveGameRoom$.subscribe(() => {
      this.cardPositionPerRoomApiService.updateCardsPositionPerRoom(this.cprs).subscribe((cprs: CardPositionPerRoom[] | undefined) => {
        if (cprs !== undefined) {
          // console.log(`Updated CPRs on save: ${JSON.stringify(cprs)}`);
        }
      });
    });
  }

  private deleteCardPositionPerRoom(id: number) {
    // TODO: Delete from the bridge table
    this.cprs = this.cprs.filter(cpr => cpr.cardPositionPerRoomId !== id);

    // TODO: If it's the only reference in there, then delete the entire card from the database
    this.cardPositionPerRoomApiService.deleteCardPositionPerRoom(id);
  }

  onDragStarted(event: CdkDragStart<any>, item: CardPositionPerRoom) {
    let mouseAU = this.dndBoardService.getMouseAUCoordinates();
    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.dragOffset = {
      x: mouseAU.gridX - item.dndPosition.x,
      y: mouseAU.gridY - item.dndPosition.y
    };
  }

  onDragMoved(event: CdkDragMove) {
    // TODO: If snap to grid, then run snap to grid else do what we have currently

   // const element = event.source.element.nativeElement; // Get the draggable element's DOM node

   let snapToGrid: boolean = true;
    
   /* 
   This matches your expected input.

Coordinate Math
Your function subtracts the board's bounding rect (rect.left, rect.top) from the pointer position, then adds scroll, then converts to AU.

This is the correct approach if your board is scrolled and zoomed, and your camera is managed via scroll position (not a separate camera variable).

Caveats
Make sure dndBoardElement is the actual scrollable board element.

If your camera is managed by scroll, do not add cameraX/cameraY elsewhere in the conversion.

If you programmatically pan (not just scroll), you may need to adjust your math as previously discussed.

Summary Table
Usage Scenario	Will it work?	Notes
Board scrolls to pan	Yes	Your function is correct.
Board pans programmatically (cameraX/Y)	Only if you adjust math	You must factor in cameraX/Y instead of scrollLeft/scrollTop.
   */

    if (snapToGrid) {
    let mouseMoveLog: string = `On Drag Moved:
     Mouse Screen coordinates: (${event.pointerPosition.x}, ${event.pointerPosition.y})
     Mouse AU coordinates: (${JSON.stringify(this.dndBoardService.getMouseAUCoordinates())})
     Grid size AU: ${this.dndBoardService.getGridSizeAU()}
     Camera coordinates AU: (${JSON.stringify(this.dndBoardService.getCameraCoordinates())})
     Viewport size: (${this.viewportWidth}, ${this.viewportHeight})
     Zoom Level: ${this.dndBoardService.zoom}
     Scaled cell size screen: ${this.dndBoardService.getScaledCellSize()}`;

      // 3. Log everything
      // console.log(mouseMoveLog);
      // this.dndBoardService.updateMouseAUCoordinatesFromScreen(event.pointerPosition.x, event.pointerPosition.y, this.dndBoard.nativeElement);
      
      // this.setDndBoardMousePosition(event.pointerPosition.x, event.pointerPosition.y);
      // console.log(`On drag move card position per room before snap: ${JSON.stringify(event.pointerPosition)}`);
      /*let cellSizeScreen = this.dndBoardService.getScaledCellSize();
      
      // event.pointerPosition = this.snapToGrid(cellSizeScreen, event.pointerPosition);
     let mouseScreenCoordinates = this.dndBoardService.getMouseScreenCoordinates();
     this.snapToGridPosition = this.snapToGrid(cellSizeScreen, {x: mouseScreenCoordinates.screenX, y: mouseScreenCoordinates.screenY});
      */
     // this.snapToGridPosition = this.snapToGrid(cellSizeScreen, event.pointerPosition);
      // console.log(`On drag move card position per room after snap: ${JSON.stringify(event.pointerPosition)}`);
    } 
  }

  /* 
  Based on your code and the search results, yes, this is likely occurring because the camera's viewport bounds are being updated during interactions while items are being positioned. Here's the breakdown:

Key Reasons for Disappearing Items
Camera Boundary Checks
Your isPositionInCameraSpace() filters items based on current camera bounds. If camera coordinates update mid-drag or due to scroll/zoom events, items might temporarily fall outside the visible area.

Drag Preview Rendering
Angular's CDK drag creates a preview element during drag operations. If your camera calculations affect this preview's position or visibility, it might appear to vanish.

Coordinate System Mismatch
The updateMouseAUCoordinatesFromScreen() method converts screen to AU coordinates without clamping, but isPositionInCameraSpace uses clamped camera bounds. A dragged item's calculated position could briefly exist outside clamped camera bounds.
  */

  onDragDrop(event: CdkDragDrop<any[]>, item: CardPositionPerRoom) {
    // TODO: If snap to grid, then run snap to grid else do what we have currently
    let snapToGrid: boolean = true;

    // item.dndPosition = snapToGrid ? this.snapToGridPosition: {x: event.dropPoint.x, y: event.dropPoint.y};
    let mouseAUCoordinates = this.dndBoardService.getMouseAUCoordinates();

    // Can't use auToScreenCoordinates in this case because mouse position is offsetted
    
    item.dndPosition = {x: mouseAUCoordinates.gridX - this.dragOffset.x, y: mouseAUCoordinates.gridY - this.dragOffset.y};
    
    let mouseMoveLog: string = `On Drag Dropped:
     Mouse coordinates relative to viewport: (${event.dropPoint.x}, ${event.dropPoint.y})
     Mouse AU coordinates: (${JSON.stringify(mouseAUCoordinates)})
     Mouse AU to Screen coordinates - relative to board : (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(mouseAUCoordinates.gridX, mouseAUCoordinates.gridY))})
     Dnd Position: (${JSON.stringify(item.dndPosition)})
     Viewport dimensions: (${JSON.stringify(this.dndBoardService.getViewportDimensions())})
     Grid size AU: ${this.dndBoardService.getGridSizeAU()}
     Viewport size: (${this.viewportWidth}, ${this.viewportHeight})
     Zoom Level: ${this.dndBoardService.zoom}
     Scaled cell size screen: ${this.dndBoardService.getScaledCellSize()}`;

      // 3. Log everything
      console.log(mouseMoveLog);

    // item.dndPosition = {x: event.dropPoint.x, y: event.dropPoint.y};
    // console.log(`On drag drop card position per room: ${JSON.stringify(item.dndPosition)}`);

    // console.log(`On drag drop: AU - ${JSON.stringify(item.dndPosition)}), Screen PX - ${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(item.dndPosition.x, item.dndPosition.y))}`);
    
    this.updateCardPositionPerRoom(item);
  }

  snapToGrid(gridSize: number, userPointerPosition: Point)
  {
    let { offsetX, offsetY } = snapToGridNearestVertex(gridSize, userPointerPosition.x, userPointerPosition.y);

    // console.log(`Offset snapToGrid: ${JSON.stringify({offsetX, offsetY})}`);

    return { x: offsetX, y: offsetY };
  }

  // https://stackoverflow.com/a/69324787
  // FIXME: Only works with standalone drags
  computeDragRenderPos(userPointerPosition: Point, dragRef: DragRef, dimensions: DOMRect, pickupPositionInElement: Point) {
    let gridSize: number = 50; 
    let { offsetX, offsetY } = snapToGridCellCentre(gridSize, userPointerPosition.x, userPointerPosition.y);

    // console.log(`Offset computeDragRenderPos: ${JSON.stringify({offsetX, offsetY})}`);

    return { x: offsetX, y: offsetY };
  }
}
