import { CdkDropList } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, DestroyRef, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dimensions } from 'ngx-image-cropper';
import { mergeMap, switchMap, tap } from 'rxjs';
import { GridComponent } from '../../../../../shared/grid/grid.component';
import { Coordinates, logInfo, stringify } from '../../../../../utils/utils';
import { CardEditorCardDto } from '../../../../card-game-core/card-editor/models/card-editor-card-dto';
import { CardEditorFacadeService } from '../../../../card-game-core/card-editor/services/facade/card-editor-facade.service';
import { CardPositionPerRoomComponent } from '../../../../card-game-core/card-position-per-room/component/card-position-per-room.component';
import { CardPositionPerRoom } from '../../../../card-game-core/card-position-per-room/model/card-position-per-room';
import { CardPositionPerRoomApiService } from '../../../../card-game-core/card-position-per-room/services/api/card-position-per-room-api.service';
import { DEFAULT_CARD_SCALE } from '../../../../card-game-core/utils/card.constants';
import { GameRoomService } from '../../../../game-room/services/core/game-room.service';
import { Style } from '../../../../style/models/style';
import { DndBoardService } from '../../service/dnd-board.service';
import { DndBoardLayerComponent } from '../layer/dnd-board-layer.component';
import { CardPositionPerRoomService } from '../../../../card-game-core/card-position-per-room/services/facade/card-position-per-room.service';
import { CardPositionPerRoomOperationsService } from '../../../../card-game-core/card-position-per-room/services/operations/card-position-per-room-operations.service';

@Component({
  selector: 'app-dnd-board',
  host: {
    '(document:keyup)': 'handleCtrlUp($event)',
    '(mouseover)': 'mouseover()',
    '(mouseout)': 'mouseout()',
    '(document:mousemove)': 'onMouseMove($event)',
    '(wheel)': 'onWheel($event)',
    '(window:keydown)': 'handleKeyDown($event)',
    '(dblclick)': 'onDoubleClick($event)',
    '(window:resize)': 'onResize()',
    '(pan)': 'onPan($event)',
    '(panstart)': 'onPanStart($event)',
    '(panmove)': 'onPanMove($event)',
    '(panend)': 'onPanEnd($event)'
  },
  imports: [
    CdkDropList,
    CardPositionPerRoomComponent,
    DndBoardLayerComponent,
    GridComponent
  ],
  templateUrl: './dnd-board.component.html',
  styleUrl: './dnd-board.component.scss'
})
export class DndBoardComponent implements AfterViewInit {
  @ViewChild('grid') grid: ElementRef<HTMLDivElement> = {} as ElementRef<HTMLDivElement>;

  @ViewChild('dndBoard') dndBoard: ElementRef<HTMLDivElement> = {} as ElementRef<HTMLDivElement>;
  // TODO:
  // 1. If drags on top of something that is droppable
  // 2. Then appear menu to determine whether to add to it

  protected shouldSnapToGrid: boolean = false;

  protected gridDimensions: Dimensions = {
    width: 0,
    height: 0
  }

  protected cellSizeScreen: number = 0;

  private isHovering: boolean = false;

  protected itemRenderScale: number = DEFAULT_CARD_SCALE;

  protected cprs: CardPositionPerRoom[] = [];

  private cardEditorCardDtoOperations: Map<string, Function> = new Map<string, Function>([
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.updateCard(cardEditorCardDto)],
    ['delete', (cardId: string) => this.deleteCard(cardId)]
  ]);

  /*
  // TODO: Fix as well, there's board translations and then the translation of the card instead, which should really be in the Cprs, not here
  private dndBoardTransformations: Map<string, Function> = new Map<string, Function>([
    ['translation', (cardEditorCardDto: CardEditorCardDto) => this.updateCard(cardEditorCardDto)],
    ['scale', (itemRenderScale: number, screenPositionCache: Map<string, Coordinates>, cardsPositionPerRoomScale: number) => this.onScaleTransformation(itemRenderScale, screenPositionCache, cardsPositionPerRoomScale)]
  ]);
  */

  private dndBoardTransformations: Map<string, Function> = new Map<string, Function>([
    ['scale', (scale: number) => this.onScaleTransformation(scale)]
  ]);

  protected handleCtrlUp(event: KeyboardEvent): void {
    if (event.key === 'Control' && this.isHovering) {
      this.shouldSnapToGrid = !this.shouldSnapToGrid;
    }
  }

  protected mouseover(): void {
    this.isHovering = true;
  }

  protected mouseout(): void {
    this.isHovering = false;
  }

  // TODO: Populate this
  private readonly dndBoardService: DndBoardService = inject<DndBoardService>(DndBoardService);

  private readonly cardEditorFacadeService: CardEditorFacadeService = inject<CardEditorFacadeService>(CardEditorFacadeService);

  private readonly gameRoomService: GameRoomService = inject<GameRoomService>(GameRoomService);

  private readonly cardPositionPerRoomApiService: CardPositionPerRoomApiService = inject<CardPositionPerRoomApiService>(CardPositionPerRoomApiService);

  private readonly cardPositionPerRoomOperationsService: CardPositionPerRoomOperationsService = inject<CardPositionPerRoomOperationsService>(CardPositionPerRoomOperationsService);

  // TODO: This should be a facade service
  private readonly cardPositionPerRoomService: CardPositionPerRoomService = inject<CardPositionPerRoomService>(CardPositionPerRoomService);

  private readonly destroyRef: DestroyRef = inject<DestroyRef>(DestroyRef);

  protected mouseMoveLog: string = '';

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

  // TODO: Have a dictionary for layers + cprs per layer

  constructor() {
    this.postShowAllItems();
    this.updateGridSize();

    this.cardEditorFacadeService.subscribeToCompletedOperations(this.cardEditorCardDtoOperations, this.destroyRef);

    this.onSaveGameRoom();

    this.onShowAllItems();

    this.createCpr(); // CHECKME, write here?

    effect(() => {
      if (parseFloat(this.gameRoomService.$currentGameRoomId()) > 0) {
        this.getCprsByRoomId(this.gameRoomService.$currentGameRoomId());
      }
    }); // FIXME: Why is it when you reload, it doesn't grab all the cprs
    // GET http://localhost:8080/api/GameRooms/1 500
  }

  public ngOnInit(): void {
    this.onZoomLevel();
  }

  ngAfterViewInit(): void {
    this.updateCameraOnScroll();
  }

  protected updateCameraOnScroll(): void {
    let wrapper: HTMLDivElement = this.dndBoard.nativeElement;

    // Calculate camera AU directly from scroll
    // When converting scroll position to camera AU position, do NOT add the current cameraX/cameraY.
    // You want the scroll position alone to determine the new camera AU.
    // If you add cameraX in screenToAUCoordinates when converting scroll to AU, you get a value that is always offset, so scrolling back to the same place doesn't yield the same camera coordinates.
    let scroll: Coordinates = {
      x: wrapper.scrollLeft,
      y: wrapper.scrollTop
    }

    let camera: Coordinates = this.dndBoardService.calculateCameraPositionFromScroll(scroll);
    let viewportDimensions: Dimensions = { width: wrapper.clientWidth, height: wrapper.clientHeight };

    this.dndBoardService.setCameraCoordinates(camera, viewportDimensions);
    // this.dndBoardService.setScreenPxDimensions(viewportDimensions.width, viewportDimensions.height);
    // console.log(`On update camera - Set Dnd Board Camera: Camera AU coordinates: ${stringify(this.dndBoardService.getCameraCoordinates())}, Camera screen coordinates: ${stringify({scrollLeft, scrollTop})}`);
    this.dndBoardService.onUpdateCamera();
  }

  protected handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'ShiftLeft') {
      this.dndBoardService.setOnShowAllItems();
    }
  }

  private postShowAllItems(): void {
    this.dndBoardService.postShowAllItems$.pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.scrollBasedOnCamera('smooth');
      })
  }

  private scrollBasedOnCamera(scrollBehavior: 'auto' | 'smooth' = 'auto'): void {
    if (this.dndBoard && this.dndBoard.nativeElement) {
      let scroll: Coordinates = this.dndBoardService.calculateScrollPosiiton();

      this.dndBoard.nativeElement.scrollTo({
        left: scroll.x,
        top: scroll.y,
        behavior: scrollBehavior // Rapid, repeated updates (like during drag or continuous zoom), smooth can cause a "lag" or "rubber-banding" effect
      });
    };
  }

  protected onScroll(event: Event): void {
    this.updateCameraOnScroll();
  }

  protected onMouseMove(event: MouseEvent): void {
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

    this.dndBoardService.setOnMouseMove(mouseScreenX, mouseScreenY, mouseX, mouseY);

    /*this.mouseMoveLog = `On Mouse Move:
     Mouse Screen coordinates (clientX, clientY): (${mouseScreenX}, ${mouseScreenY})
      Mouse relative to board (mouseX, mouseY): (${mouseX}, ${mouseY})
     Mouse AU to Screen coordinates: (${stringify(this.dndBoardService.aUToScreenCoordinates(this.dndBoardService.mouseAUCoordinates))})
     Grid size AU: ${this.dndBoardService.getGridSizeAU()}
     Grid size screen: (${this.gridWidthScreen}, ${this.gridHeightScreen})
     Zoom Level: ${this.dndBoardService.zoom}
     Cell size screen: ${this.cellSizeScreen}`;

  // 3. Log everything
    console.log(this.mouseMoveLog);*/
  }

  // NOTE: Call this.updateCameraOnScroll immediately after zooming, scrolling, or resizing, using the current viewport size.
  protected onWheel(event: WheelEvent): void {
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

    console.log(`%c${logInfo(this.constructor.name, this.onWheel.name)} - Camera position on zoom: ${stringify(newCamera)}`, `color: #084b83; background: #bbe6e4; padding: 5px; border-radius: 5px;`);

    if (this.isCameraTranslationHighEnough(prevCamera, newCamera))
      // We need to scroll because the board's a scrollable container 
      this.scrollBasedOnCamera('auto');

    let rect: DOMRect = this.dndBoard.nativeElement.getBoundingClientRect();

    this.dndBoardService.updateMouseAUCoordinatesFromScreen(screen, rect);
    this.dndBoardService.setZoomLevel();

    // console.log(`On Wheel: Grid size AU: ${stringify(this.dndBoardService.screenToAUCoordinates(this.gridWidthScreen, this.gridHeightScreen))} Grid size screen: ${this.gridWidthScreen}, ${this.gridHeightScreen}, Zoom Level: ${this.dndBoardService.zoom}, Cell Size: ${this.cellSizeScreen}`);

    // 1.1 = 10%
  }

  // CHKECME: Ok, clientDimensions or innerDimensions by this point
  // Client includes padding, inner includes scrollbar, so...

  // Also should the viewport stuff genuinely just be in the layer instead

  protected getViewportDimensions(): Dimensions {
    let wrapper: HTMLDivElement = this.dndBoard.nativeElement;
    let viewportDimensions: Dimensions = { width: wrapper.clientWidth, height: wrapper.clientHeight };

    return viewportDimensions;
  }

  protected getCameraMovementVector(mouseAUBefore: Coordinates, mouseAUAfter: Coordinates): Coordinates {
    return {
      x: mouseAUBefore.x - mouseAUAfter.x,
      y: mouseAUBefore.y - mouseAUAfter.y
    }
  }

  protected isCameraTranslationHighEnough(prevCamera: Coordinates, newCamera: Coordinates): boolean {
    // TODO: Move to a constants file
    let CAMERA_MOVEMENT_VECTOR_DIFFERENCE_EPSILON: number = 1e-6;

    return (Math.abs(newCamera.x - prevCamera.x) > CAMERA_MOVEMENT_VECTOR_DIFFERENCE_EPSILON ||
      Math.abs(newCamera.y - prevCamera.y) > CAMERA_MOVEMENT_VECTOR_DIFFERENCE_EPSILON);
  }

  // So this is all meant to prevent the hypersensivity of the movement
  private applyCameraMovementVectorConstraints(d: Coordinates): Coordinates {
    // Prevents camera microjitter, there's potential floating-point noise.
    // TODO: Move to a constants file
    let DEAD_ZONE: number = 0.01;
    if (Math.abs(d.x) < DEAD_ZONE) d.x = 0;
    if (Math.abs(d.y) < DEAD_ZONE) d.y = 0;

    // Reduce camera magnitude by a value between 0 and 1 to make zooming feel smoother.
    // Acts as 'interpolation' essentially but not really interpolation
    // TODO: Move to a constants file
    let SENSITIVITY: number = 0.7;

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
  private adjustCameraForZoom(mouseAUBefore: Coordinates, mouseAUAfter: Coordinates): void {
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

  private centreCameraOnMouse(mouseAU: Coordinates): void {
    let viewportDimensions: Dimensions = this.getViewportDimensions();

    // Calculate the visible area in AU based on the current zoom and viewport size
    let visibleDimensions: Dimensions = this.dndBoardService.getVisibleDimensionsAU(viewportDimensions);

    // Set camera so that mouseAU is at the center of the viewport
    let camera: Coordinates = {
      x: mouseAU.x - visibleDimensions.width / 2,
      y: mouseAU.y - visibleDimensions.height / 2
    };

    this.dndBoardService.setCameraCoordinates(
      camera,
      viewportDimensions
    );
  }

  protected onDoubleClick(event: MouseEvent): void {
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

  protected onResize(): void {
    this.updateCameraOnScroll();
  }

  protected onPan(event: any): void {
    // Handle the pan event
    // console.log('Pan event detected', event);
    // Access event properties like event.deltaX and event.deltaY 
    // to get the distance and direction of the pan.
  }

  protected onPanStart(event: any): void {
    // Handle the start of the pan gesture
    // console.log('Pan started', event);
  }

  protected onPanMove(event: any): void {
    // Handle the pan move gesture
    // console.log('Pan moved', event);
  }

  protected onPanEnd(event: any): void {
    // Handle the end of the pan gesture
    // console.log('Pan ended', event);
  }

  private onZoomLevel(): void {
    this.dndBoardService.zoomLevel$.subscribe((zoomLevel: number) => {
      this.updateGridSize();
      this.setItemRenderScale();
    })
  }

  // Modify to work with the dndBoardTransformations?
  // Problem is getItemRenderScale is indeed different then the scaledCellSize
  private setItemRenderScale(): void {
    if (this.dndBoardService.getItemRenderScale() !== 0)
      this.itemRenderScale = this.dndBoardService.getItemRenderScale();
  }

  // TODO: Merge with the above
  private onScaleTransformation(scale: number): void {
    // Here's the thing, what would 'scale' be, the zoom level? 
  }

  private updateGridSize(): void {
    // Dynamically update the background-size of the grid
    this.cellSizeScreen = this.dndBoardService.getScaledCellSize(); // Base cell size (50px) scaled by zoom

    this.gridDimensions = this.dndBoardService.getScaledDndBoardSizeScreen();

    // console.log(`On update Grid Size: Grid size screen: ${this.gridWidthScreen}, ${this.gridHeightScreen}, Zoom Level: ${this.dndBoardService.zoom}, Cell Size: ${this.cellSizeScreen}`);
  }

  protected getCameraCoordinates(): Coordinates {
    return this.dndBoardService.getCameraCoordinates();
  }

  protected getCellSize(): number {
    return this.dndBoardService.getScaledCellSize();
  }

  protected getLayerStyle(): Omit<Style, 'styleId'> {
    let viewport: Dimensions = this.dndBoardService.getViewportDimensions();

    return {
      'position': 'absolute',
      'width': `${viewport.width}px`,
      'height': `${viewport.height}px`,
      'inset': 'inherit',
      'border': '2px dashed red'
    }
  }

  protected getGridDimensions(): {
    width: string,
    height: string
  } {
    return {
      width: `${this.gridDimensions.width}px`,
      height: `${this.gridDimensions.height}px`
    }
  }

  private updateCard(cardEditorCardDto: CardEditorCardDto): void {
    if (cardEditorCardDto) {
      let index: number = this.cprs.findIndex(cpr => cpr.card.cardId === cardEditorCardDto.card.cardId);

      if (index !== -1) this.cprs[index].card = cardEditorCardDto.card;
    }
  }

  private deleteCard(cardId: string): void {
    this.cprs = this.cprs.filter(cpr => cpr.card.cardId !== cardId);

    // Reset the counter to prevent integer overflow
    if (this.cprs.length <= 0) this.dndBoardService.globalZIndexCounter = 0;
  }

  // CHECKME: Check card position per room operations service, should this be a service
  // Also, do we even need to update the cprs? I don't think so
  private onSaveGameRoom(): void {
    this.gameRoomService.onSaveGameRoom$.pipe(
      tap(() => this.dndBoardService.normaliseZIndexes(this.cprs)),
      switchMap(() => this.cardPositionPerRoomApiService.updateCardsPositionPerRoom(this.cprs)),
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result) this.cprs = result;
      });
  }

  private getCprsByRoomId(gameRoomId: string): void {
    this.cardPositionPerRoomApiService.getCardsPositionPerRoomByRoomId(
      gameRoomId)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result) {
          this.cprs = result;

          this.dndBoardService.globalZIndexCounter = Math.max(...this.cprs.map((c: CardPositionPerRoom) => c.zIndex)) + 1;
        }
      });
  }

  // 50830.3 * 50 * 1 = 2,541,515
  private createCpr(): void {
    this.cardPositionPerRoomService.createdCardPositionPerRoom$
      .pipe(
        mergeMap((cpr: CardPositionPerRoom) => {
          return this.cardPositionPerRoomApiService.createCardPositionPerRoom(cpr);
        })
      )
      .subscribe((result: CardPositionPerRoom | undefined) => {
        if (result) this.cprs.push(result);
      });
  }

  protected getUnculled(): CardPositionPerRoom[] {
    return this.cprs.filter((cpr: CardPositionPerRoom) => this.dndBoardService.isPositionInCameraSpace({ x: cpr.dndPosition.x, y: cpr.dndPosition.y }, this.dndBoardService.getViewportDimensions()) == true)
  }

  protected onSetPosition(info: {
    id: string,
    position: Coordinates
  }): void {
    let { id, position } = info;

    this.cprs.forEach((original: CardPositionPerRoom) =>
      original.cardPositionPerRoomId === id
        ? {
          ...original,
          dndPosition: {
            ...original.dndPosition, x: position.x, y: position.y
          }
        }
        : original
    )
  };

  // TODO: Refactor this as we're probably going to have more items than just cards
  private onShowAllItems(): void {
    this.dndBoardService.onShowAllItems$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      let coordinates: Coordinates[] = this.cprs.map(cpr => ({
        x: cpr.dndPosition.x,
        y: cpr.dndPosition.y
      }));

      this.dndBoardService.showAllItems(coordinates);
    })
  }
}
