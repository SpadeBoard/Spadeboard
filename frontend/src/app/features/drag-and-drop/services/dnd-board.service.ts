import { Injectable, HostListener, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DndBoardService {
  // TODO: Set the grid size here
  // NOTE: 1 x 1 AU = 50 x 50 px (CSS)

  // Angujlar Unit
  // NOTE: If 1 is the scale we're starting at, it makes sense that you can't zoom out further than that 
  aU: number = 1;

  cellSizeScreen: number = 20; // PX
  dndBoardSizeScreen: number = 60000;  // 20 x 20 AU// 50000;// 1000 x 1000 // PX

  // AU
  cameraX: number = 0;
  cameraY: number = 0;

  // TODO: Make zoom variable private
  zoom: number = 1; // 1 = 100%, 2 = 200%, 0.5 = 50%
  maxZoom: number = 3;
  minZoom: number = 0.5;

  private zoomLevel$$ = new Subject<number>();
  zoomLevel$: Observable<number> = this.zoomLevel$$.asObservable();

  setZoomLevel(zoomLevel: number): void {
    this.zoomLevel$$.next(zoomLevel);
  }

  // Table of expected values:

  // Grid X: 10, Grid Y: 10, CameraX: 10, cameraY: 10
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
    let gridX = Math.floor(screenX / (this.cellSizeScreen * this.zoom) + this.cameraX);
    let gridY = Math.floor(screenY / (this.cellSizeScreen * this.zoom) + this.cameraY);

    return {gridX, gridY};
  }

  // https://stackoverflow.com/questions/38534900/how-to-make-angular2-listen-to-pinchmove-and-pan-event-simultaneously
  // https://github.com/angular/angular/issues/10328
  onPan(deltaX: number, deltaY: number): void {
    this.cameraX += deltaX;
    this.cameraY += deltaY;
  }

  zoomIn(value: number): void {
    this.zoom = this.clamp(this.zoom * value, this.minZoom, this.maxZoom);
  }
  
  zoomOut(value: number): void {
    this.zoom = this.clamp(this.zoom / value, this.minZoom, this.maxZoom);
  }
  
  // TODO: Put in utils
  clamp(value: number, min: number, max: number): number {
    if (min > max) throw new Error(`Invalid clamp range`);
    return Math.min(Math.max(value, min), max);
  }

  setCameraCoordinates(cameraX: number, cameraY: number, screenWidthPx: number, screenHeightPx: number) {
    let boardWidthAU = this.getGridSizeAU();
    let boardHeightAU = this.getGridSizeAU();
    let visibleWidthAU = this.getVisibleDimensionAU(screenWidthPx);
    let visibleHeightAU = this.getVisibleDimensionAU(screenHeightPx);

    this.cameraX = this.clamp(cameraX, 0, boardWidthAU - visibleWidthAU);
    this.cameraY = this.clamp(cameraY, 0, boardHeightAU - visibleHeightAU);
  }

  getGridSizeAU(): number {
    return this.dndBoardSizeScreen/this.cellSizeScreen;
  }

  getVisibleDimensionAU(screenPx: number): number {
    return screenPx / (this.cellSizeScreen * this.zoom);
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
}
