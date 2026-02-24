import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { clamp, Coordinates, Dimensions, getBoundingBox, getScaledItemRenderDimensions } from '../../../../utils/utils';
import { DND_BOARD_SIZE_AU } from '../../utils/dnd.constants';
import { CardPositionPerRoom } from '../../../card-game-core/card-position-per-room/model/card-position-per-room';
@Injectable({
  providedIn: 'root'
})
export class DndBoardService {
  // TODO: Replace with transformation matrices instead for the global and local coordinates by the other service
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

  // TODO: Refactor this, probably use this for all items on board
  public globalZIndexCounter: number = 0;

  private onShowAllItems$$: Subject<void> = new Subject<void>();
  public readonly onShowAllItems$: Observable<void> = this.onShowAllItems$$.asObservable();

  private postShowAllItems$$: Subject<void> = new Subject<void>();
  public readonly postShowAllItems$: Observable<void> = this.postShowAllItems$$.asObservable();

  // CHECKME: Ok, we're gonna need this for the transformation matrices and converting from global to local coordinates
  private readonly cellSizeScreen: number = 50; // PX

  public dndBoardSizeAU: Dimensions = {
    width: DND_BOARD_SIZE_AU,
    height: DND_BOARD_SIZE_AU
  } // 50000

  // TODO: So figure this out, do we have the user set the size of the board via arbitray units? Or the actual global units?
  // Let's just do the AU units for now then
  // It should also probably be a constant value that's accessible anywhere? Maybe.
  // Probably should make it a modal signal first and foremost

  // AU
  public readonly MAX_SHIFT = 10;

  // AU
  public camera: Coordinates = {
    x: 0,
    y: 0
  }

  // TODO: Make zoom variable private
  public zoom: number = 1; // 1 = 100%, 2 = 200%, 0.5 = 50%

  private readonly maxZoom: number = 3;
  private readonly minZoom: number = 0.1;

  public viewportDimensions: Dimensions = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // AU
  // TODO: Make separate conversion functions for mouse position
  public mouseAUCoordinates: Coordinates = {
    x: 0,
    y: 0
  };

  public getMouseScreenCoordinates(): Coordinates {
    return this.aUToScreenCoordinates(this.mouseAUCoordinates);
  }

  private zoomLevel$$ = new Subject<number>();
  public readonly zoomLevel$: Observable<number> = this.zoomLevel$$.asObservable();

  private screenPxDimensions$$ = new Subject<{x: number, y: number}>();
  public readonly screenPxDimensions$: Observable<{x: number,  y: number}> = this.screenPxDimensions$$.asObservable();

  private onMouseMove$$ = new Subject<{mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number}>();
  public readonly onMouseMove$: Observable<{mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number}> = this.onMouseMove$$.asObservable();

  private onUpdateCamera$$ = new Subject<void>();
  public readonly onUpdateCamera$: Observable<void> = this.onUpdateCamera$$.asObservable();

  public onUpdateCamera(): void {
    this.onUpdateCamera$$.next();
  }
  
  public setOnMouseMove(mouseScreenX: number, mouseScreenY: number, mouseX: number, mouseY: number) {
    this.onMouseMove$$.next({mouseScreenX, mouseScreenY, mouseX, mouseY});
  }

  public setZoomLevel(zoomLevel?: number): void {
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
  public aUToScreenCoordinates(coordinates: Coordinates): Coordinates {
    return { 
      x: (coordinates.x - this.camera.x) * this.getScaledCellSize(), 
      y: (coordinates.y - this.camera.y) * this.getScaledCellSize() 
    };
  }

  // screen coordinates relative to the wrapper
  // For VIEWPORT POSITIONING:
  public screenToAUCoordinates(coordinates: Coordinates): Coordinates {
    return {
      x: clamp(coordinates.x / this.getScaledCellSize() + this.camera.x, 0 , this.dndBoardSizeAU.width),
      y: clamp(coordinates.y / this.getScaledCellSize() + this.camera.y, 0 , this.dndBoardSizeAU.height)
    };
  }

  // https://stackoverflow.com/questions/38534900/how-to-make-angular2-listen-to-pinchmove-and-pan-event-simultaneously
  // https://github.com/angular/angular/issues/10328
  public onPan(deltaX: number, deltaY: number): void {
    this.camera.x += deltaX;
    this.camera.y += deltaY;
  }

  public zoomIn(value: number): void {
    this.zoom = clamp(parseFloat((this.zoom * value).toFixed(2)), this.minZoom, this.maxZoom);
  }
  
  public zoomOut(value: number): void {
    this.zoom = clamp(parseFloat((this.zoom / value).toFixed(2)), this.minZoom, this.maxZoom);
  }

  public setCameraCoordinates(camera: Coordinates, screen: Dimensions) {
    let boardWidthAU: number = this.getGridSizeAU().width;
    let boardHeightAU: number = this.getGridSizeAU().height;

    let visibleAU: Dimensions = this.getVisibleDimensionsAU(screen);

    let maxCameraX: number = Math.max(0, boardWidthAU - visibleAU.width);
    let maxCameraY: number = Math.max(0, boardHeightAU - visibleAU.height);

    this.viewportDimensions = screen;
  
    this.camera = {
      x: clamp(camera.x, 0, maxCameraX),
      y: clamp(camera.y, 0, maxCameraY)
    };
  }

  public getViewportDimensions(): Dimensions {
    return this.viewportDimensions;
  }

  public getVisibleDimensionsAU(screen: Dimensions): Dimensions {
    return {
      width: this.getVisibleDimensionAU(screen.width),
      height: this.getVisibleDimensionAU(screen.height)
    }
  }

  public getVisibleDimensionAU(screenPx: number): number {
    return screenPx / this.getScaledCellSize();
  }

  public getGridSizeAU(): Dimensions {
    return this.dndBoardSizeAU;
  }

  public getCameraCoordinates(): Coordinates {
    return this.camera;
  }

  // Item Position AU: Raw position on virtual board
  // Original: Physical image dimensions
  public getScaledItemRenderData(itemPosition: Coordinates, original: Dimensions
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
public getScaledItemRenderCoordinates(itemPosition: Coordinates): Coordinates {
  return this.aUToScreenCoordinates(itemPosition);
}

  public getItemRenderScale(): number {
    return this.getScaledCellSize() / this.cellSizeScreen;
  }

  public getScaledCellSize(): number {
    return this.cellSizeScreen * this.zoom;
  }
  
  public getScaledDndBoardSizeScreen(): Dimensions {
    return {
      width: this.dndBoardSizeAU.width * this.getScaledCellSize(),
      height: this.dndBoardSizeAU.height * this.getScaledCellSize()
    }
  }
  
  public getScaledGridWidthScreen(): number {
    return this.dndBoardSizeAU.width *this.getScaledCellSize();
  }
  
  public getScaledGridHeightScreen(): number {
    return this.dndBoardSizeAU.height * this.getScaledCellSize();
  }

  public setScreenPxDimensions(screenPxX: number, screenPxY: number) {
    this.screenPxDimensions$$.next({x: screenPxX, y: screenPxY});
  }

  // AU
  public calculateCameraPositionFromScroll(scroll: Coordinates): Coordinates {
    return {
      x: scroll.x / this.getScaledCellSize(),
      y: scroll.y / this.getScaledCellSize()
    }
  }

  public calculateScrollPosiiton(): Coordinates {
    return {
      x: this.camera.x * this.getScaledCellSize(),
      y: this.camera.y * this.getScaledCellSize()
    }
  }

  public isPositionInCameraSpace(
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

  public updateMouseAUCoordinatesFromScreen(
    screen: Coordinates,
    rect: DOMRect
  ): void {
    let scaledCellSize: number = this.getScaledCellSize();
    // mouse / scaled cell size converts to AU
    let offsetAU: Coordinates = {
      x: (screen.x - rect.left)/ scaledCellSize,
      y: (screen.y - rect.top)/ scaledCellSize
    };

    // Get the current camera position in AU (already updated by updateCamera)
    let camera: Coordinates = this.getCameraCoordinates(); // Or this.dndBoardService.getCameraCoordinates()

    // Mouse AU = camera AU + offset in AU
    this.mouseAUCoordinates = {
      x: clamp(camera.x + offsetAU.x, 0, this.getGridSizeAU().width),
      y: clamp(camera.y + offsetAU.y, 0, this.getGridSizeAU().height)
    }
  }

  public setOnShowAllItems(): void {
    this.onShowAllItems$$.next();
  }

  public setPostShowAllItems(): void {
    this.postShowAllItems$$.next();
  }

  public showAllItems(aUCoordinates: Coordinates[]): void {
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

  // CHECKME: Move somewhere else?
  
  // NOTE: Just to make sure that they all have unique IDs
  // Because the issue is despite overlapping
  // They can share the same zIndex, so the order ends up being dependent on the DOM
  public normaliseZIndexes(cprs: CardPositionPerRoom[]): void {
    // Use all cprs, not just unculled
    let sorted: CardPositionPerRoom[] = cprs.slice().sort((a: CardPositionPerRoom, b: CardPositionPerRoom) => a.zIndex - b.zIndex);
    sorted.forEach((cpr: CardPositionPerRoom, idx: number) => cpr.zIndex = idx);

    this.globalZIndexCounter = sorted.length + 1;
  }
}
