import { Injectable, HostListener, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DndPosition } from '../models/dnd-types';
import { clamp, Coordinates, Dimensions, getBoundingBox, getScaledItemRenderDimensions } from '../../../utils/utils';
@Injectable({
  providedIn: 'root'
})
export class DndBoardService {
  /* 
      A. Store Only Base Values in the Service
      cellSizeScreen (base, e.g., 50px)
      zoom (e.g., 1, 2, 0.5)
      dndBoardSizeAU (e.g., 20 for 20x20 grid)
      cameraX, cameraY

    B. Expose Getters for Derived Values
      typescript
      get scaledCellSize(): number {
        return this.cellSizeScreen * this.zoom;
      }

      get dndBoardSizeScreen(): number {
        return this.dndBoardSizeAU * this.scaledCellSize;
      }

      get gridWidthScreen(): number {
        return this.dndBoardSizeAU * this.scaledCellSize;
      }

      get gridHeightScreen(): number {
        return this.dndBoardSizeAU * this.scaledCellSize;
      }
    
      C. Expose Conversion Methods
      aUToScreenCoordinates(x, y)
      screenToAUCoordinates(screenX, screenY)
      (Optionally) getGridSizeAU(), getVisibleDimensionAU(screenPx), etc.

    D. Expose Observables for Reactive Updates
      zoomLevel$

      camera$

      (Optional) gridSize$
  */

  // TODO: Set the grid size here
  // NOTE: 1 x 1 AU = 50 x 50 px (CSS)

  // TODO: Refactor all this, make the dndPositions actually use AU

  // Angujlar Unit
  // NOTE: If 1 is the scale we're starting at, it makes sense that you can't zoom out further than that 

  private onShowAllItems$$: Subject<void> = new Subject<void>();
  onShowAllItems$: Observable<void> = this.onShowAllItems$$.asObservable();

  private postShowAllItems$$: Subject<void> = new Subject<void>();
  postShowAllItems$: Observable<void> = this.postShowAllItems$$.asObservable();

  private cellSizeScreen: number = 50; // PX
  private dndBoardSizeAU: number = 1000; // So dndBoardSizeScreen is 50000

  // AU
  readonly MAX_SHIFT = 10;

  // AU
  camera: Coordinates = {
    x: 0,
    y: 0
  }

  // TODO: Make zoom variable private
  zoom: number = 1; // 1 = 100%, 2 = 200%, 0.5 = 50%
  private readonly maxZoom: number = 3;
  private readonly minZoom: number = 0.1;

  viewportDimensions: Dimensions = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // AU
  // TODO: Make separate conversion functions for mouse position
  private mouseAUCoordinates: Coordinates = {
    x: 0,
    y: 0
  };

  setMouseAUCoordinates(mouseAUCoordinates: Coordinates) {
    this.mouseAUCoordinates = mouseAUCoordinates;
  }

  getMouseAUCoordinates(): Coordinates {
    // console.log(`Get mouse AU coordinates: ${JSON.stringify(this.mouseAUCoordinates)}`);
    return this.mouseAUCoordinates;
  }

  getMouseScreenCoordinates(): Coordinates {
    return this.aUToScreenCoordinates(this.mouseAUCoordinates);
  }

  private zoomLevel$$ = new Subject<number>();
  zoomLevel$: Observable<number> = this.zoomLevel$$.asObservable();

  private screenPxDimensions$$ = new Subject<{x: number, y: number}>();
  screenPxDimensions$: Observable<{x: number,  y: number}> = this.screenPxDimensions$$.asObservable();

  private onMouseMove$$ = new Subject<{mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number}>();
  onMouseMove$: Observable<{mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number}> = this.onMouseMove$$.asObservable();

  private onUpdateCamera$$ = new Subject<void>();
  onUpdateCamera$: Observable<void> = this.onUpdateCamera$$.asObservable();

  onUpdateCamera() {
    this.onUpdateCamera$$.next();
  }
  
  setOnMouseMove(mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number) {
    this.onMouseMove$$.next({mouseScreenX, mouseScreenY, mouseX, mouseY});
  }

  setZoomLevel(zoomLevel?: number): void {
    if (zoomLevel) {
      this.zoomLevel$$.next(zoomLevel);
      return;
    }

    this.zoomLevel$$.next(this.getItemRenderScale());
  }

  // Grid X: 10, Grid Y: 10, CameraX: 10, cameraY: 10
  // NOTE: These are for items on the board
  /*
  Why Are You Getting Negative Values?
  A. Camera Position
    If your cameraX or cameraY is greater than the item's x or y,
    then (x - cameraX) will be negative.
  */

  // For BOARD ITEMS (cards/grid):
  aUToScreenCoordinates(coordinates: Coordinates): Coordinates {
    return { 
      x: (coordinates.x - this.camera.x) * this.getScaledCellSize(), 
      y: (coordinates.y - this.camera.y) * this.getScaledCellSize() 
    };
  }

  // screen coordinates relative to the wrapper
  // For VIEWPORT POSITIONING:
  screenToAUCoordinates(coordinates: Coordinates): Coordinates {
    return {
      x: clamp(coordinates.x / this.getScaledCellSize() + this.camera.x, 0 , this.dndBoardSizeAU),
      y: clamp(coordinates.y / this.getScaledCellSize() + this.camera.y, 0 , this.dndBoardSizeAU)
    };
  }

  // https://stackoverflow.com/questions/38534900/how-to-make-angular2-listen-to-pinchmove-and-pan-event-simultaneously
  // https://github.com/angular/angular/issues/10328
  onPan(deltaX: number, deltaY: number): void {
    this.camera.x += deltaX;
    this.camera.y += deltaY;
  }

  zoomIn(value: number): void {
    this.zoom = clamp(parseFloat((this.zoom * value).toFixed(2)), this.minZoom, this.maxZoom);
  }
  
  zoomOut(value: number): void {
    this.zoom = clamp(parseFloat((this.zoom / value).toFixed(2)), this.minZoom, this.maxZoom);
  }

  setCameraCoordinates(camera: Coordinates, screen: Dimensions) {
    let boardWidthAU: number = this.getGridSizeAU();
    let boardHeightAU: number = this.getGridSizeAU();

    let visibleAU: Dimensions = this.getVisibleDimensionsAU(screen);

    let maxCameraX: number = Math.max(0, boardWidthAU - visibleAU.width);
    let maxCameraY: number = Math.max(0, boardHeightAU - visibleAU.height);

    this.viewportDimensions = screen;
  
    this.camera = {
      x: clamp(camera.x, 0, maxCameraX),
      y: clamp(camera.y, 0, maxCameraY)
    };
  }

  getViewportDimensions(): Dimensions {
    return this.viewportDimensions;
  }

  getVisibleDimensionsAU(screen: Dimensions): Dimensions {
    return {
      width: this.getVisibleDimensionAU(screen.width),
      height: this.getVisibleDimensionAU(screen.height)
    }
  }

  getVisibleDimensionAU(screenPx: number): number {
    return screenPx / this.getScaledCellSize();
  }

  getGridSizeAU(): number {
    return this.dndBoardSizeAU;
  }

  getCameraCoordinates(): Coordinates {
    return this.camera;
  }

  // Item Position AU: Raw position on virtual board
  // Original: Physical image dimensions
  getScaledItemRenderData(itemPosition: Coordinates, original: Dimensions
  ): {
    screenCoordinates: Coordinates;
    scaledDimensions: Dimensions
  } {
    let screenCoordinates: Coordinates = this.getScaledItemRenderCoordinates(itemPosition);
    let scale: number = this.getItemRenderScale();
    let scaledDimensions: Dimensions = getScaledItemRenderDimensions(original, scale);

    return { screenCoordinates, scaledDimensions };
  }

  // Use let scale: number = this.getItemRenderScale();

// Returns the screen coordinates for rendering the item
getScaledItemRenderCoordinates(itemPosition: Coordinates): Coordinates {
  return this.aUToScreenCoordinates(itemPosition);
}

  getItemRenderScale() {
    return this.getScaledCellSize() / this.cellSizeScreen;
  }

  getScaledCellSize(): number {
    return this.cellSizeScreen * this.zoom;
  }
  
  getScaledDndBoardSizeScreen(): number {
    return this.dndBoardSizeAU * this.getScaledCellSize();
  }
  
  getScaledGridWidthScreen(): number {
    return this.dndBoardSizeAU *this.getScaledCellSize();
  }
  
  getScaledGridHeightScreen(): number {
    return this.dndBoardSizeAU * this.getScaledCellSize();
  }

  setScreenPxDimensions(screenPxX: number, screenPxY: number) {
    this.screenPxDimensions$$.next({x: screenPxX, y: screenPxY});
  }

  isPositionInCameraSpace(
    position: Coordinates,
    screen: Dimensions
  ): boolean {
    let visibleDimensions: Dimensions = this.getVisibleDimensionsAU(screen);

    // 25% of visible width and height
    // Want the buffer to scale with the visible world, so it always feels “proportional” to what the user sees
    // let buffer: number = 0.25 * Math.min(visibleDimensions.width, visibleDimensions.height);

    // FIXED: When zooming in way too close, the cards were disappearing
    // NOTE: Want items to always be visible for a certain distance from the screen edge, regardless of zoom.
    let desiredBufferPx: number = 500; // 10 AU at 1 zoom, I did this because I think the this.dndBoardService.MAX_SHIFT is what's causing it and it's 10 AU, you probably want to have a math function for getting this, store this.dndBoardService.MAX_SHIFT here as a general variable instead?
    let buffer: number = desiredBufferPx / this.getScaledCellSize(); // Converts to AU

    let left: number = this.camera.x - buffer;
    let top: number = this.camera.y - buffer;
    let right: number = left + visibleDimensions.width + buffer; // Allows for some leeway, item gets dragged off screen
    let bottom: number = top + visibleDimensions.height + buffer; // Allows for some leeway, item gets dragged off screen

    /*console.log({
      "Item Grid X": x,
      "Item Grid Y": y,
      "Camera X (AU)": this.camera.x,
      "Camera Y (AU)": this.camera.y,
      "Visible Width (AU)": visibleDimensions.width,
      "Visible Height (AU)": visibleDimensions.height,
      "Camera Left Bound (AU)": left,
      "Camera Right Bound (AU)": right,
      "Camera Top Bound (AU)": top,
      "Camera Bottom Bound (AU)": bottom
    });*/
  
    return (
      position.x >= left &&
      position.x < right &&
      position.y >= top &&
      position.y < bottom
    );
  }

  updateMouseAUCoordinatesFromScreen(
    screen: Coordinates,
    rect: DOMRect
  ) {
    let scaledCellSize: number = this.getScaledCellSize();
    // mouse / scaled cell size converts to AU
    let offsetAU: Coordinates = {
      x: (screen.x - rect.left)/ scaledCellSize,
      y: (screen.y - rect.top)/ scaledCellSize
    };

    // Get the current camera position in AU (already updated by updateCamera)
    let camera: Coordinates = this.getCameraCoordinates(); // Or this.dndBoardService.getCameraCoordinates()

    // Mouse AU = camera AU + offset in AU
    let mouseAUCoordinates: Coordinates = {
      x: clamp(camera.x + offsetAU.x, 0, this.getGridSizeAU()),
      y: clamp(camera.y + offsetAU.y, 0, this.getGridSizeAU())
    }

     this.setMouseAUCoordinates(mouseAUCoordinates);
  }

  setOnShowAllItems() {
    this.onShowAllItems$$.next();
  }

  setPostShowAllItems() {
    this.postShowAllItems$$.next();
  }

  showAllItems(aUCoordinates: Coordinates[]): void {
    if (aUCoordinates.length <= 0)
      return;

    // Find region to focus on
    let { min, max } = getBoundingBox(aUCoordinates);

    // Center camera on points
    let centre: Coordinates = {
      x: (min.x + max.x) / 2, 
      y: (min.y + max.y) / 2
    };

    let boxDimensions: Dimensions = {
      width: max.x -min.x,
      height: max.y - min.y
    };

    let viewportDimensions: Dimensions = {
      width: this.viewportDimensions.width,
      height: this.viewportDimensions.height
    }

    // Ensure all points are visible
    // Calculate the zoom to fit the bounding box, with a small margin (e.g., 10%)
    let margin: number = 1.1;
    let zoomX: number = viewportDimensions.width / (boxDimensions.width * this.cellSizeScreen * margin);
    let zoomY: number = viewportDimensions.height / (boxDimensions.height * this.cellSizeScreen * margin);
    
    let fitZoom: number = Math.min(zoomX, zoomY, this.maxZoom);

    this.zoom = clamp(fitZoom, this.minZoom, this.maxZoom);

    // FIXED: Items were being rendered too closely with one another after this process, zoom was still set to 'fit all' value, but the cards scale wasn't updated
    this.setZoomLevel(this.zoom);

    let scaledCellSize: number = this.getScaledCellSize();

    // Move camera so center is in viewport center
    // Center region on screen
    let visibleDimensionsAU: Dimensions = {
      width: viewportDimensions.width / scaledCellSize,
      height: viewportDimensions.height / scaledCellSize
    }
  
    let cameraCoordinates: Coordinates = {
      x: centre.x - visibleDimensionsAU.width / 2,
      y: centre.y - visibleDimensionsAU.width / 2
    };
    this.setCameraCoordinates(cameraCoordinates, viewportDimensions);
    this.onUpdateCamera();
    
    this.setPostShowAllItems();
  }
}
