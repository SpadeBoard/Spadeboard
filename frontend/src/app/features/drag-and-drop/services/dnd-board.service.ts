import { Injectable, HostListener, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DndPosition } from '../models/dnd-types';
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
      aUToScreenCoordinates(gridX, gridY)
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

  private cellSizeScreen: number = 50; // PX
  private dndBoardSizeAU: number = 1000; // So dndBoardSizeScreen is 50000

  // AU
  private cameraX: number = 0;
  private cameraY: number = 0;

  // TODO: Make zoom variable private
  zoom: number = 1; // 1 = 100%, 2 = 200%, 0.5 = 50%
  private readonly maxZoom: number = 3;
  private readonly minZoom: number = 0.1;

  private viewportWidthPx: number = window.innerWidth; 
  private viewportHeightPx: number = window.innerHeight;
  // AU
  // TODO: Make separate conversion functions for mouse position
  private mouseAUCoordinates: { gridX: number; gridY: number; } = {
    gridX: 0,
    gridY: 0
  };

  setMouseAUCoordinates(mouseAUCoordinates: {
    gridX: number;
    gridY: number;
  }) {
    this.mouseAUCoordinates = mouseAUCoordinates;
  }

  getMouseAUCoordinates(): {
    gridX: number;
    gridY: number;
  } {
    // console.log(`Get mouse AU coordinates: ${JSON.stringify(this.mouseAUCoordinates)}`);
    return this.mouseAUCoordinates;
  }

  getMouseScreenCoordinates(): {
    screenX: number;
    screenY: number;
  } {
    return this.aUToScreenCoordinates(this.mouseAUCoordinates.gridX, this.mouseAUCoordinates.gridY);
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
    If your cameraX or cameraY is greater than the item's gridX or gridY,
    then (gridX - cameraX) will be negative.
  */

  // For BOARD ITEMS (cards/grid):
  aUToScreenCoordinates(gridX: number, gridY: number): {
    screenX: number;
    screenY: number;
  } {
    let screenX = (gridX - this.cameraX) * this.getScaledCellSize();
    let screenY = (gridY - this.cameraY) * this.getScaledCellSize();

    return { screenX, screenY };
  }

  // screen coordinates relative to the wrapper
  // For VIEWPORT POSITIONING:
  screenToAUCoordinates(screenX: number, screenY: number): {
    gridX: number;
    gridY: number;
  }{
    let gridX = this.clamp(screenX / this.getScaledCellSize() + this.cameraX, 0 , this.dndBoardSizeAU);
    let gridY =  this.clamp(screenY / this.getScaledCellSize() + this.cameraY, 0 , this.dndBoardSizeAU);

    return {gridX, gridY};
  }

  // https://stackoverflow.com/questions/38534900/how-to-make-angular2-listen-to-pinchmove-and-pan-event-simultaneously
  // https://github.com/angular/angular/issues/10328
  onPan(deltaX: number, deltaY: number): void {
    this.cameraX += deltaX;
    this.cameraY += deltaY;
  }

  zoomIn(value: number): void {
    this.zoom = this.clamp(parseFloat((this.zoom * value).toFixed(2)), this.minZoom, this.maxZoom);
  }
  
  zoomOut(value: number): void {
    this.zoom = this.clamp(parseFloat((this.zoom / value).toFixed(2)), this.minZoom, this.maxZoom);
  }
  
  // TODO: Put in utils
  clamp(value: number, min: number, max: number): number {
    // console.log(`[CLAMP] value: ${value}, min: ${min}, max: ${max}`);

    if (min > max) throw new Error(`Invalid clamp range`);
    return Math.min(Math.max(value, min), max);
  }

  setCameraCoordinates(cameraX: number, cameraY: number, screenWidthPx: number, screenHeightPx: number) {
    let boardWidthAU = this.getGridSizeAU();
    let boardHeightAU = this.getGridSizeAU();
    let visibleWidthAU = this.getVisibleDimensionAU(screenWidthPx);
    let visibleHeightAU = this.getVisibleDimensionAU(screenHeightPx);

    let maxCameraX = Math.max(0, boardWidthAU - visibleWidthAU);
    let maxCameraY = Math.max(0, boardHeightAU - visibleHeightAU);

    this.viewportWidthPx = screenWidthPx;
    this.viewportHeightPx = screenHeightPx;

    this.cameraX = this.clamp(cameraX, 0, maxCameraX);
    this.cameraY = this.clamp(cameraY, 0, maxCameraY);
  }

  getViewportDimensions(): {viewportWidthPx: number, viewportHeightPx: number} {
    return {viewportWidthPx: this.viewportWidthPx, viewportHeightPx: this.viewportHeightPx};
  }

  getVisibleDimensionAU(screenPx: number): number {
    return screenPx / this.getScaledCellSize();
  }

  getGridSizeAU(): number {
    return this.dndBoardSizeAU;
  }

  getCameraCoordinates(): {
    cameraX: number;
    cameraY: number;
  } {
    return { cameraX: this.cameraX, cameraY: this.cameraY };
  }

  // Item Position AU: Raw position on virtual board
  // Original: Physical image dimensions
  getScaledItemRenderData(itemPositionXAU: number, itemPositionYAU: number, originalWidth: number, originalHeight: number): {
    screenX: number;
    screenY: number;
    scaledWidth: number;
    scaledHeight: number;
  } {
    let { screenX, screenY } = this.aUToScreenCoordinates(itemPositionXAU, itemPositionYAU);

    let scale = this.getItemRenderScale();

    // Scale width and height
    let scaledWidth = originalWidth * scale;
    let scaledHeight = originalHeight * scale;
  
    return { screenX, screenY, scaledWidth, scaledHeight };
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
    gridX: number,
    gridY: number,
    screenWidthPx: number,
    screenHeightPx: number
  ): boolean {
    let visibleWidthAU = this.getVisibleDimensionAU(screenWidthPx);
    let visibleHeightAU = this.getVisibleDimensionAU(screenHeightPx);
  
    let desiredBufferPx = 50; // 1 AU
    let buffer = desiredBufferPx / this.getScaledCellSize();

    let left = this.cameraX - buffer;
    let top = this.cameraY - buffer;
    let right = left + visibleWidthAU + buffer; // Allows for some leeway, item gets dragged off screen
    let bottom = top + visibleHeightAU + buffer; // Allows for some leeway, item gets dragged off screen

    /*console.log({
      "Item Grid X": gridX,
      "Item Grid Y": gridY,
      "Camera X (AU)": this.cameraX,
      "Camera Y (AU)": this.cameraY,
      "Visible Width (AU)": visibleWidthAU,
      "Visible Height (AU)": visibleHeightAU,
      "Camera Left Bound (AU)": left,
      "Camera Right Bound (AU)": right,
      "Camera Top Bound (AU)": top,
      "Camera Bottom Bound (AU)": bottom
    });*/
  
    return (
      gridX >= left &&
      gridX < right &&
      gridY >= top &&
      gridY < bottom
    );
  }

  updateMouseAUCoordinatesFromScreen(
    screenX: number,
    screenY: number,
    dndBoardElement: HTMLElement
  ) {
    // Get bounding rect and scroll
    let rect = dndBoardElement.getBoundingClientRect();
    
    let mouseX = screenX - rect.left;
    let mouseY = screenY - rect.top;
    
    let  scaledCellSize = this.getScaledCellSize();
    let  offsetXAU = mouseX / scaledCellSize;
    let  offsetYAU = mouseY / scaledCellSize;

    // Get the current camera position in AU (already updated by updateCamera)
    let  { cameraX, cameraY } = this.getCameraCoordinates(); // Or this.dndBoardService.getCameraCoordinates()

    // Mouse AU = camera AU + offset in AU
    let  gridX = this.clamp(cameraX + offsetXAU, 0, this.getGridSizeAU());
    let  gridY = this.clamp(cameraY + offsetYAU, 0, this.getGridSizeAU());
 
     this.setMouseAUCoordinates({ gridX, gridY });
  }
}
