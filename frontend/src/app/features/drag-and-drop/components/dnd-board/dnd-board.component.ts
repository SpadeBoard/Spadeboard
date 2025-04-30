import { AfterViewInit, Component, ElementRef, HostListener, inject, input, output, ViewChild } from '@angular/core';
import { DndBoardService } from '../../services/dnd-board.service';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { map, Subscription } from 'rxjs';
import { Deck } from '../../../card-game-core/models/deck';
import { Card, CardPositionPerRoom } from '../../../card-game-core/models/card';
import { isCard, isDeck } from '../../../card-game-core/utils/card-game-core.utils';
import { CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, CdkDropList } from '@angular/cdk/drag-drop';
import { DndFunctionality } from '../../models/dnd-functionality';
import { CardEditorComponent } from '../../../card-game-core/components/card-editor/card-editor.component';
import { DisplaceCardMenuComponent } from '../../../card-game-core/components/displace-card-menu/displace-card-menu.component';
import { CardFace } from '../../../card-game-core/models/card-face';
import { CardFaceElement } from '../../../card-game-core/models/card-face-element';
import { CardPositionPerRoomService } from '../../../card-game-core/services/card-game-core/card-position-per-room.service';
import { CardPositionPerRoomComponent } from '../../../card-game-core/components/card-position-per-room/card-position-per-room.component';
import { GameRoomService } from '../../../game-room/services/game-room.service';
import { DndBoardGridComponent } from '../dnd-board-grid/dnd-board-grid.component';
import { DndBoardLayerComponent } from '../dnd-board-layer/dnd-board-layer.component';

// ROLE: AUTOLOAD

// TODO: FIGURE OUT HIERARCHAL RELATIONSHIP
/************************************************************
app-dnd-board (root)          ↑ 
|   app-dnd-wrapper (parent)          | 
|                                                      |
↓     app-card (child)                       | signal up (card)

/*************************************************************/
@Component({
  selector: 'app-dnd-board',
  imports: [
    CdkDropList,
    CardPositionPerRoomComponent,
    DndBoardGridComponent,
    DndBoardLayerComponent
  ],
  templateUrl: './dnd-board.component.html',
  styleUrl: './dnd-board.component.css'
})
export class DndBoardComponent implements AfterViewInit {
  @ViewChild('grid') grid!: ElementRef<HTMLDivElement>;
  @ViewChild('dndBoard') dndBoard!: ElementRef<HTMLDivElement>;
  // TODO:
  // 1. If drags on top of something that is droppable
  // 2. Then appear menu to determine whether to add to it

  // TODO: Populate this
  private dndBoardService: DndBoardService= inject(DndBoardService);

  gameRoomId: number = 1;
  ownerId: string = "5811e387-1551-4090-9485-a3ebe30efb5a"; // TODO: Should be admin of room

  mouseMoveLog: string = '';

  /* 
  Function	Uses cellSizeScreen?	Uses zoom?	Uses scroll?	Uses camera?	Output Unit
  aUToScreenCoordinates	Yes	Yes	No	Yes	Screen pixels
  getOffset	No	Yes	Yes	Yes	Hybrid/unknown
  getMouseContentPosition	No	Yes	Yes	Yes	Hybrid/unknown
  */
  
  /* 
    Action	Camera Coordinates Change?	Why?
    User scrolls	Yes	Scroll offset → new camera AU position
    Zooms in/out	Sometimes	Visible area changes, may clamp camera to new max
    Resizes viewport	Sometimes	Visible area changes, may clamp camera to new max
    Programmatic pan/center	Yes	Code sets new camera position
    Mouse move (no pan)	No	Camera stays put
    Mouse drag to pan	Yes	Camera follows drag
    Hover/select item	No	Camera stays put
  */
 ngAfterViewInit(): void {
  this.updateCamera();
 }
 
  updateCamera() {
    let wrapper = this.dndBoard.nativeElement;

    let scrollLeft = wrapper.scrollLeft;
    let scrollTop = wrapper.scrollTop;

    // Calculate camera AU directly from scroll
    // When converting scroll position to camera AU position, do NOT add the current cameraX/cameraY.
    // You want the scroll position alone to determine the new camera AU.
    // If you add cameraX in screenToAUCoordinates when converting scroll to AU, you get a value that is always offset, so scrolling back to the same place doesn't yield the same camera coordinates.
    let cameraX = scrollLeft / this.dndBoardService.getScaledCellSize();
    let cameraY = scrollTop / this.dndBoardService.getScaledCellSize();

    let viewportWidthPx = wrapper.clientWidth;
    let viewportHeightPx = wrapper.clientHeight;
  
    this.dndBoardService.setCameraCoordinates(cameraX, cameraY, viewportWidthPx, viewportHeightPx);
    // this.dndBoardService.setScreenPxDimensions(viewportWidthPx, viewportHeightPx);
    // console.log(`On update camera - Set Dnd Board Camera: Camera AU coordinates: ${JSON.stringify(this.dndBoardService.getCameraCoordinates())}, Camera screen coordinates: ${JSON.stringify({scrollLeft, scrollTop})}`);
    this.dndBoardService.onUpdateCamera();
  }

  onScroll(event: Event) {
    this.updateCamera();
  }

  @HostListener('document:mousemove', ['$event']) 
  onMouseMove(event: MouseEvent) {
    // 1. Get mouse screen coordinates
  let mouseScreenX = event.clientX;
  let mouseScreenY = event.clientY;

  let rect = this.dndBoard.nativeElement.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;

  this.dndBoardService.updateMouseAUCoordinatesFromScreen(event.clientX, event.clientY, this.dndBoard.nativeElement);
  // this.setDndBoardMousePosition(mouseScreenX, mouseScreenY);
  // 2. Convert to AU coordinates
  // let mouseAUCoordinates = this.dndBoardService.screenToAUCoordinates(mouseScreenX, mouseScreenY);
  
 //  let mouseAUCoordinates = this.dndBoardService.getMouseAUCoordinates();
  this.dndBoardService.setOnMouseMove(mouseScreenX, mouseScreenY, mouseX, mouseY);

    /*this.mouseMoveLog = `On Mouse Move:
     Mouse Screen coordinates (clientX, clientY): (${mouseScreenX}, ${mouseScreenY})
      Mouse relative to board (mouseX, mouseY): (${mouseX}, ${mouseY})
     Mouse AU to Screen coordinates: (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.getMouseAUCoordinates().gridX, this.dndBoardService.getMouseAUCoordinates().gridY))})
     Grid size AU: ${this.dndBoardService.getGridSizeAU()}
     Grid size screen: (${this.gridWidthScreen}, ${this.gridHeightScreen})
     Zoom Level: ${this.dndBoardService.zoom}
     Cell size screen: ${this.cellSizeScreen}`;

  // 3. Log everything
    console.log(this.mouseMoveLog);*/
  }

  // NOTE: Call this.updateCamera immediately after zooming, scrolling, or resizing, using the current viewport size.
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

       // TODO: Use subscriptions to determine what to do after zooming out, like resizing the images
    if (event.deltaY < 0) this.dndBoardService.zoomIn(1.1);
    else this.dndBoardService.zoomOut(1.1);


    this.updateCamera();

    // this.setDndBoardMousePosition(event.clientX, event.clientY);
    this.dndBoardService.updateMouseAUCoordinatesFromScreen(event.clientX, event.clientY, this.dndBoard.nativeElement);   
    this.dndBoardService.setZoomLevel();
    
    // console.log(`On Wheel: Grid size AU: ${JSON.stringify(this.dndBoardService.screenToAUCoordinates(this.gridWidthScreen, this.gridHeightScreen))} Grid size screen: ${this.gridWidthScreen}, ${this.gridHeightScreen}, Zoom Level: ${this.dndBoardService.zoom}, Cell Size: ${this.cellSizeScreen}`);

    // 1.1 = 10%
  }

  /* 
  Mouse-driven panning	Yes	Camera position changes
Mouse hover for tooltip	No	Camera doesn't change
Mouse move for drag	Yes (if camera pans)	Camera position may change
Mouse move for highlight	No	Only need to update highlight
  */

  @HostListener('window:resize')
  onResize() {
    this.updateCamera();
  }

  @HostListener('pan', ['$event'])
  onPan(event: any): void {
    // Handle the pan event
    // console.log('Pan event detected', event);
    // Access event properties like event.deltaX and event.deltaY 
    // to get the distance and direction of the pan.
  }

  @HostListener('panstart', ['$event'])
  onPanStart(event: any): void {
    // Handle the start of the pan gesture
    // console.log('Pan started', event);
  }

  @HostListener('panmove', ['$event'])
  onPanMove(event: any): void {
    // Handle the pan move gesture
    // console.log('Pan moved', event);
  }

  @HostListener('panend', ['$event'])
  onPanEnd(event: any): void {
    // Handle the end of the pan gesture
    // console.log('Pan ended', event);
  }
}
