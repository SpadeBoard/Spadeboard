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
  private readonly minZoom: number = 0.5;

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
    console.log(`Get mouse AU coordinates: ${JSON.stringify(this.mouseAUCoordinates)}`);
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

  setZoomLevel(zoomLevel?: number): void {
    if (zoomLevel) {
      this.zoomLevel$$.next(zoomLevel);
      return;
    }

    this.zoomLevel$$.next(this.zoom);
  }

  // Grid X: 10, Grid Y: 10, CameraX: 10, cameraY: 10
  // NOTE: These are for items on the board
  /*
  Why Are You Getting Negative Values?
  A. Camera Position
    If your cameraX or cameraY is greater than the item's gridX or gridY,
    then (gridX - cameraX) will be negative.
  */
  aUToScreenCoordinates(gridX: number, gridY: number): {
    screenX: number;
    screenY: number;
  } {
    let screenX = (gridX - this.cameraX) * this.cellSizeScreen * this.zoom;
    let screenY = (gridY - this.cameraY) * this.cellSizeScreen * this.zoom;

    return { screenX, screenY };
  }

  screenToAUCoordinates(screenX: number, screenY: number): {
    gridX: number;
    gridY: number;
  }{
    let gridX = this.clamp(screenX / (this.cellSizeScreen * this.zoom) + this.cameraX, 0 , this.dndBoardSizeAU);
    let gridY =  this.clamp(screenY / (this.cellSizeScreen * this.zoom) + this.cameraY, 0 , this.dndBoardSizeAU);

    return {gridX, gridY};
  }
  // ================================

  // https://stackoverflow.com/questions/38534900/how-to-make-angular2-listen-to-pinchmove-and-pan-event-simultaneously
  // https://github.com/angular/angular/issues/10328
  onPan(deltaX: number, deltaY: number): void {
    this.cameraX += deltaX;
    this.cameraY += deltaY;
  }

  zoomIn(value: number): void {
    // console.log(`On zoom in before: ${this.zoom * value} Min zoom: ${this.minZoom}, Max zoom: ${this.maxZoom}`);

    this.zoom = this.clamp(this.zoom * value, this.minZoom, this.maxZoom);

    // console.log(`On zoom in after: ${this.zoom} Min zoom: ${this.minZoom}, Max zoom: ${this.maxZoom}`);
  }
  
  zoomOut(value: number): void {
    // console.log(`On zoom out before: ${this.zoom * value} Min zoom: ${this.minZoom}, Max zoom: ${this.maxZoom}`);

    this.zoom = this.clamp(this.zoom / value, this.minZoom, this.maxZoom);

    // console.log(`On zoom out after: ${this.zoom} Min zoom: ${this.minZoom}, Max zoom: ${this.maxZoom}`);
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

    this.cameraX = this.clamp(cameraX, 0, maxCameraX);
    this.cameraY = this.clamp(cameraY, 0, maxCameraY);
  }

  getVisibleDimensionAU(screenPx: number): number {
    return screenPx / (this.cellSizeScreen * this.zoom);
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

  // Item pixel: Raw position on virtual board
  // Original: Physical image dimensions
  getScaledItemRenderData(itemPixelX: number, itemPixelY: number, originalWidth: number, originalHeight: number): {
    screenX: number;
    screenY: number;
    scaledWidth: number;
    scaledHeight: number;
  } {
    let screenX = (itemPixelX - this.cameraX * this.cellSizeScreen) * this.zoom;
    let screenY = (itemPixelY - this.cameraY * this.cellSizeScreen) * this.zoom;
  
    let scaledWidth = originalWidth * this.zoom;
    let scaledHeight = originalHeight * this.zoom;
  
    return { screenX, screenY, scaledWidth, scaledHeight };
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
  
    let left = this.cameraX;
    let top = this.cameraY;
    let right = left + visibleWidthAU;
    let bottom = top + visibleHeightAU;

    console.log({
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
    });
  
    return (
      gridX >= left &&
      gridX < right &&
      gridY >= top &&
      gridY < bottom
    );
  }
}
