import { CdkDropList } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dimensions } from 'ngx-image-cropper';
import { clamp, Coordinates } from '../../../../utils/utils';
import { CardPositionPerRoomComponent } from '../../../card-game-core/components/card-position-per-room/card-position-per-room.component';
import { DndBoardService } from '../../services/dnd-board.service';
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

  gameRoomId: string = "1";
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

  constructor() {
    this.postShowAllItems();
  }
  
 ngAfterViewInit(): void {
  this.updateCameraOnScroll();
 }
 
  updateCameraOnScroll() {
    let wrapper = this.dndBoard.nativeElement;

    let scrollLeft = wrapper.scrollLeft;
    let scrollTop = wrapper.scrollTop;

    // Calculate camera AU directly from scroll
    // When converting scroll position to camera AU position, do NOT add the current cameraX/cameraY.
    // You want the scroll position alone to determine the new camera AU.
    // If you add cameraX in screenToAUCoordinates when converting scroll to AU, you get a value that is always offset, so scrolling back to the same place doesn't yield the same camera coordinates.
    let camera: Coordinates = {x: scrollLeft / this.dndBoardService.getScaledCellSize(), y: scrollTop / this.dndBoardService.getScaledCellSize()};
    let viewportDimensions: Dimensions = {width: wrapper.clientWidth, height: wrapper.clientHeight};
  
    this.dndBoardService.setCameraCoordinates(camera, viewportDimensions);
    // this.dndBoardService.setScreenPxDimensions(viewportDimensions.width, viewportDimensions.height);
    // console.log(`On update camera - Set Dnd Board Camera: Camera AU coordinates: ${JSON.stringify(this.dndBoardService.getCameraCoordinates())}, Camera screen coordinates: ${JSON.stringify({scrollLeft, scrollTop})}`);
    this.dndBoardService.onUpdateCamera();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'ShiftLeft') {
      this.dndBoardService.setOnShowAllItems();
    }
  }

   postShowAllItems() {
    this.dndBoardService.postShowAllItems$.pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.scrollBasedOnCamera('smooth');
    })
  }

  scrollBasedOnCamera(scrollBehavior: 'auto' | 'smooth' = 'auto'): void {
    if (this.dndBoard && this.dndBoard.nativeElement) {
        let scrollLeft: number = this.dndBoardService.camera.x * this.dndBoardService.getScaledCellSize();
        let scrollTop: number = this.dndBoardService.camera.y * this.dndBoardService.getScaledCellSize();
        this.dndBoard.nativeElement.scrollTo({
          left: scrollLeft,
          top: scrollTop,
          behavior: scrollBehavior // Rapid, repeated updates (like during drag or continuous zoom), smooth can cause a "lag" or "rubber-banding" effect
        });
      };
  }

  onScroll(event: Event) {
    this.updateCameraOnScroll();
  }

  @HostListener('document:mousemove', ['$event']) 
  onMouseMove(event: MouseEvent) {
    // 1. Get mouse screen coordinates
  let mouseScreenX: number = event.clientX;
  let mouseScreenY: number = event.clientY;

  let screen: Coordinates = {
    x: event.clientX,
    y: event.clientY
  }

  let rect: DOMRect = this.dndBoard.nativeElement.getBoundingClientRect();
  let mouseX: number = event.clientX - rect.left;
  let mouseY: number = event.clientY - rect.top;

  this.dndBoardService.updateMouseAUCoordinatesFromScreen(screen, rect);
  // this.setDndBoardMousePosition(mouseScreenX, mouseScreenY);
  // 2. Convert to AU coordinates
  // let mouseAUCoordinates = this.dndBoardService.screenToAUCoordinates(mouseScreenX, mouseScreenY);
  
 //  let mouseAUCoordinates = this.dndBoardService.getMouseAUCoordinates();
  this.dndBoardService.setOnMouseMove(mouseScreenX, mouseScreenY, mouseX, mouseY);

    /*this.mouseMoveLog = `On Mouse Move:
     Mouse Screen coordinates (clientX, clientY): (${mouseScreenX}, ${mouseScreenY})
      Mouse relative to board (mouseX, mouseY): (${mouseX}, ${mouseY})
     Mouse AU to Screen coordinates: (${JSON.stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.getMouseAUCoordinates()))})
     Grid size AU: ${this.dndBoardService.getGridSizeAU()}
     Grid size screen: (${this.gridWidthScreen}, ${this.gridHeightScreen})
     Zoom Level: ${this.dndBoardService.zoom}
     Cell size screen: ${this.cellSizeScreen}`;

  // 3. Log everything
    console.log(this.mouseMoveLog);*/
  }

  // NOTE: Call this.updateCameraOnScroll immediately after zooming, scrolling, or resizing, using the current viewport size.
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

    let screen: Coordinates = { x: event.clientX, y: event.clientY };

    // We need this because the problem is it scrolls even though there's no difference between positioning
    let prevCamera: Coordinates = this.dndBoardService.camera;

    // adjustCameraForZoom: We need the difference between before positioning and after
    let mouseAUBefore: Coordinates = this.dndBoardService.screenToAUCoordinates(screen);

    // Gotta zoom first so it scales correctly, the relationship between screen (pixel) coordinates and board (AU) coordinates changes
    if (event.deltaY < 0) this.dndBoardService.zoomIn(1.1);
    else this.dndBoardService.zoomOut(1.1);

    let mouseAUAfter: Coordinates = this.dndBoardService.screenToAUCoordinates(screen);

    // FIXME: So this isn't exact, but should be good enough for now? Unless we want to use the other function centreCameraOnMouse but pass in the scroll behavior as auto?
    // Actually centreCameraOnMouse was way worse
    this.adjustCameraForZoom(mouseAUBefore, mouseAUAfter);

    // Update rendering and mouse coordinates
    // Only scroll if the camera actually moved
    let newCamera: Coordinates = this.dndBoardService.camera;

    console.log(`Camera position on zoom: ${JSON.stringify(newCamera)}`);

    if (this.isCameraTranslationHighEnough(prevCamera, newCamera))
      // We need to scroll because the board's a scrollable container 
      this.scrollBasedOnCamera('auto');

    let rect: DOMRect = this.dndBoard.nativeElement.getBoundingClientRect();

    this.dndBoardService.updateMouseAUCoordinatesFromScreen(screen,  rect);
    this.dndBoardService.setZoomLevel();

    // console.log(`On Wheel: Grid size AU: ${JSON.stringify(this.dndBoardService.screenToAUCoordinates(this.gridWidthScreen, this.gridHeightScreen))} Grid size screen: ${this.gridWidthScreen}, ${this.gridHeightScreen}, Zoom Level: ${this.dndBoardService.zoom}, Cell Size: ${this.cellSizeScreen}`);

    // 1.1 = 10%
  }

  getViewportDimensions(): Dimensions {
     let wrapper: HTMLDivElement = this.dndBoard.nativeElement;
    let viewportDimensions: Dimensions = { width: wrapper.clientWidth, height: wrapper.clientHeight };
  
    return viewportDimensions;
  }

  getCameraMovementVector(mouseAUBefore: Coordinates, mouseAUAfter: Coordinates): Coordinates {
    return {
      x: mouseAUBefore.x - mouseAUAfter.x,
      y: mouseAUBefore.y - mouseAUAfter.y
    }
  }

  isCameraTranslationHighEnough(prevCamera: Coordinates, newCamera: Coordinates): boolean {
     let CAMERA_MOVEMENT_VECTOR_DIFFERENCE_EPSILON: number = 1e-6;

    return (Math.abs(newCamera.x - prevCamera.x) > CAMERA_MOVEMENT_VECTOR_DIFFERENCE_EPSILON ||
      Math.abs(newCamera.y - prevCamera.y) > CAMERA_MOVEMENT_VECTOR_DIFFERENCE_EPSILON);
  }

   // So this is all meant to prevent the hypersensivity of the movement
  applyCameraMovementVectorConstraints(d: Coordinates): Coordinates {
    // Prevents camera microjitter, there's potential floating-point noise.
    let DEAD_ZONE: number = 0.01;
    if (Math.abs(d.x) < DEAD_ZONE) d.x = 0;
    if (Math.abs(d.y) < DEAD_ZONE) d.y = 0;

    // Reduce camera magnitude by a value between 0 and 1 to make zooming feel smoother.
    // Acts as 'interpolation' essentially but not really interpolation
    let SENSITIVITY = 0.7;

    // Even after scaling, a large zoom or a big movement vector could cause the camera to jump.
    // Ensure the camera never shifts more than this.dndBoardService.MAX_SHIFT units (AU) per event, keeps movement manageable and prevents sudden jumps.
    /*d.x = clamp(d.x * SENSITIVITY, -this.dndBoardService.MAX_SHIFT, this.dndBoardService.MAX_SHIFT);
    d.y = clamp(d.y * SENSITIVITY, -this.dndBoardService.MAX_SHIFT, this.dndBoardService.MAX_SHIFT);
    */

    d.x *= SENSITIVITY;
    d.y *= SENSITIVITY;
    
    return d;
  }

  // NOTE: https://math.stackexchange.com/questions/2585598/3d-camera-transformation-versus-object-transformation
  adjustCameraForZoom(mouseAUBefore: Coordinates, mouseAUAfter: Coordinates): void {
    // Adjust camera so the AU point under the mouse stays fixed
    //    camera = camera + (mouseAUBefore - mouseAUAfter)
    // Shifts based on the difference before and after

    // This is basically the movement vector
    let d: Coordinates = this.applyCameraMovementVectorConstraints(this.getCameraMovementVector(mouseAUBefore, mouseAUAfter));

    // Basically what this is it's taking the camera's values and shifting by the movement vector
    let camera: Coordinates = {
      x: this.dndBoardService.camera.x + d.x,
      y: this.dndBoardService.camera.y + d.y
    }

    // We need to do this because if we're setting the camera, and the change is so small, it's going to snap back and forth otherwise
    if (!this.isCameraTranslationHighEnough(this.dndBoardService.camera, camera))
      return;

    let viewportDimensions: Dimensions = this.getViewportDimensions();

    // Clamp camera to board bounds just so it never goes out of bounds
    this.dndBoardService.setCameraCoordinates(
      camera,
      viewportDimensions
    );
  }

  centreCameraOnMouse(mouseAU: Coordinates): void {
    let viewportDimensions: Dimensions = this.getViewportDimensions();

    // Calculate the visible area in AU based on the current zoom and viewport size
    let visibleDimensions: Dimensions = this.dndBoardService.getVisibleDimensionsAU(viewportDimensions);

    // Set camera so that mouseAU is at the center of the viewport
    let camera: Coordinates = {
      x: mouseAU.x - visibleDimensions.width / 2,
      y:mouseAU.y - visibleDimensions.height / 2
    };

    this.dndBoardService.setCameraCoordinates(
      camera,
      viewportDimensions
    );
  }

  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent) {
    let screen: Coordinates = { x: event.clientX, y: event.clientY };
    let mouseAU = this.dndBoardService.screenToAUCoordinates(screen);
    this.centreCameraOnMouse(mouseAU);
    this.scrollBasedOnCamera('smooth');
  }

  /* 
  Mouse-driven panning	Yes	Camera position changes
Mouse hover for tooltip	No	Camera doesn't change
Mouse move for drag	Yes (if camera pans)	Camera position may change
Mouse move for highlight	No	Only need to update highlight
  */

  @HostListener('window:resize')
  onResize() {
    this.updateCameraOnScroll();
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
