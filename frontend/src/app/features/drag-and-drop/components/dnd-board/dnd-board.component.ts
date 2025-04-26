import { Component, ElementRef, HostListener, inject, input, output, ViewChild } from '@angular/core';
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
    CardPositionPerRoomComponent
  ],
  templateUrl: './dnd-board.component.html',
  styleUrl: './dnd-board.component.css'
})
export class DndBoardComponent {
  @ViewChild('grid') grid!: ElementRef<HTMLDivElement>;
  // TODO:
  // 1. If drags on top of something that is droppable
  // 2. Then appear menu to determine whether to add to it

  // TODO: Populate this
  private dndBoardService: DndBoardService= inject(DndBoardService);

  gameRoomId: number = 1;
  ownerId: string = "5811e387-1551-4090-9485-a3ebe30efb5a"; // TODO: Should be admin of room

  gridWidthScreen: number = 0;
  gridHeightScreen: number = 0;
  cellSizeScreen: number = 0;

  scaleLevel: number = this.dndBoardService.zoom;

  getOffset(scrollValue: number, mousePosition: number, scaleLevel: number) {
    return (scrollValue + mousePosition) / scaleLevel;
  }

  getCameraScreenPosition(clientCoordinates: {clientX: number, clientY: number}) {
    let wrapper = this.grid.nativeElement;
    let rect = wrapper.getBoundingClientRect();

    // Mouse position relative to the wrapper
    let mouseX = clientCoordinates.clientX - rect.left;
    let mouseY = clientCoordinates.clientY - rect.top;

    console.log(`Mouse position relative to the wrapper: AU - ${JSON.stringify(this.dndBoardService.screenToAUCoordinates(mouseX, mouseY))}, screen: ${mouseX}, ${mouseY}`);

    // Scroll positions before zoom
    let scrollLeft = wrapper.scrollLeft;
    let scrollTop = wrapper.scrollTop;
    
    return {cameraX: this.getOffset(scrollLeft, mouseX, this.scaleLevel), cameraY: this.getOffset(scrollTop, mouseY,  this.scaleLevel) }
  }

  mouseMoveLog: string = '';

  setDndBoardCameraPosition(mousePositionX: number, mousePositionY: number) {
    let cameraScreenPositions = this.getCameraScreenPosition({clientX: mousePositionX, clientY: mousePositionY})

    // Calculate mouse position relative to the content
    let cameraAUCoordinates = this.dndBoardService.screenToAUCoordinates(cameraScreenPositions.cameraX, cameraScreenPositions.cameraY);
    
    let wrapper = this.grid.nativeElement;
    let viewportWidthPx = wrapper.clientWidth;
    let viewportHeightPx = wrapper.clientHeight;

    this.dndBoardService.setCameraCoordinates(cameraAUCoordinates.gridX, cameraAUCoordinates.gridY,viewportWidthPx, viewportHeightPx);
  
    console.log(`On Set Dnd Board Camera: Camera AU coordinates: ${this.dndBoardService.cameraX}, ${this.dndBoardService.cameraY}, Camera screen coordinates: ${JSON.stringify(cameraScreenPositions)}`);
  }

  @HostListener('document:mousemove', ['$event']) 
  onMouseMove(event: MouseEvent) {
    // 1. Get mouse screen coordinates
  let mouseScreenX = event.clientX;
  let mouseScreenY = event.clientY;

  this.setDndBoardCameraPosition(mouseScreenX, mouseScreenY);
  // 2. Convert to AU coordinates
  let mouseAUCoordinates = this.dndBoardService.screenToAUCoordinates(mouseScreenX, mouseScreenY);

  this.mouseMoveLog = `On Mouse Move:
     Mouse Screen coordinates: (${mouseScreenX}, ${mouseScreenY})
     Mouse AU coordinates: (${JSON.stringify(mouseAUCoordinates)})
     Grid size AU: ${JSON.stringify(this.dndBoardService.screenToAUCoordinates(this.gridWidthScreen, this.gridHeightScreen))}
     Grid size screen: (${this.gridWidthScreen}, ${this.gridHeightScreen})
     Zoom Level: ${this.dndBoardService.zoom}
     Cell Size: ${this.cellSizeScreen}`;

  // 3. Log everything
  console.log(
    this.mouseMoveLog
  );
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

    /*let wrapper = this.grid.nativeElement;
    let rect = wrapper.getBoundingClientRect();

    // Mouse position relative to the wrapper
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    // Limit zoom level
    if (event.deltaY < 0)  this.dndBoardService.zoomIn(1.1);
    else this.dndBoardService.zoomOut(1.1);

    let cameraScreenPositions = this.getCameraScreenPosition({clientX: event.clientX, clientY: event.clientY})

    // Calculate mouse position relative to the content
    this.dndBoardService.cameraX = cameraScreenPositions.cameraX;
    this.dndBoardService.cameraY = cameraScreenPositions.cameraY;

    // TODO: Make what's between these a subscribable
    //  ********************************************
    // Apply new zoom
    this.scaleLevel = this.dndBoardService.zoom;

    // Set new scroll position to keep mouse at same spot
    setTimeout(() => {
      wrapper.scrollLeft = this.dndBoardService.cameraX * this.scaleLevel - mouseX;
      wrapper.scrollTop = this.dndBoardService.cameraY * this.scaleLevel - mouseY;
    });*/

    // ********************************************

       // TODO: Use subscriptions to determine what to do after zooming out, like resizing the images
    if (event.deltaY < 0) this.dndBoardService.zoomIn(1.1);
    else this.dndBoardService.zoomOut(1.1);

    this.setDndBoardCameraPosition(event.clientX, event.clientY);
   
    this.updateGridSize();
    
    this.dndBoardService.setZoomLevel(this.dndBoardService.zoom);
    
    console.log(`On Wheel: Grid size AU: ${JSON.stringify(this.dndBoardService.screenToAUCoordinates(this.gridWidthScreen, this.gridHeightScreen))} Grid size screen: ${this.gridWidthScreen}, ${this.gridHeightScreen}, Zoom Level: ${this.dndBoardService.zoom}, Cell Size: ${this.cellSizeScreen}`);

    // 1.1 = 10%
    /*
    this.scaleLevel = this.dndBoardService.zoom;*/
  }

  transform() {
    return `scale(${this.scaleLevel})`;
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

  constructor() {
    this.cellSizeScreen = this.dndBoardService.cellSizeScreen;

    this.gridWidthScreen = this.dndBoardService.dndBoardSizeScreen;
    this.gridHeightScreen = this.dndBoardService.dndBoardSizeScreen;

    // console.log(`Grid size: ${this.gridWidthScreen}, ${this.gridHeightScreen}`);
  }

  updateGridSize() {
    // Dynamically update the background-size of the grid
    this.cellSizeScreen = this.dndBoardService.cellSizeScreen * this.dndBoardService.zoom; // Base cell size (50px) scaled by zoom
    
    let aUGridCoordinates: {
      gridX: number;
      gridY: number;
    } = this.dndBoardService.screenToAUCoordinates(this.gridWidthScreen, this.gridHeightScreen);

    let screenGridCoordinates: {
      screenX: number;
      screenY: number;
    } = this.dndBoardService.aUToScreenCoordinates(aUGridCoordinates.gridX, aUGridCoordinates.gridY);

    this.gridWidthScreen = screenGridCoordinates.screenX;
    this.gridHeightScreen = screenGridCoordinates.screenY;

    console.log(`On update Grid Size: Grid size screen: ${this.gridWidthScreen}, ${this.gridHeightScreen}, Zoom Level: ${this.dndBoardService.zoom}, Cell Size: ${this.cellSizeScreen}`);
  }
}
