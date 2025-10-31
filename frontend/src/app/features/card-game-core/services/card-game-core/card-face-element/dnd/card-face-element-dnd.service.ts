import { Injectable } from '@angular/core';
import { clamp, Coordinates, Dimensions } from '../../../../../../utils/utils';
import { snapToGridNearestVertex } from '../../../../../drag-and-drop/utils/coordinate-conversions.utils';
import { DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE } from '../../../../utils/card-editor-face-preview.constants';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementDndService {

  constructor() { }

  // FIXED: The issue was that the mouse position wasin in viewport coordinates
  // But the posiiton is relative to the container
  // NOTE: It's possible to get a negative number
  public setOffset(mouse: Coordinates, position: Coordinates, rect: DOMRect, offset: Coordinates): void {
    let relative: Coordinates = this.getRelativeCoordinates(mouse, rect);

    offset.x = relative.x - position.x;
    offset.y = relative.y - position.y;
  }

  public setDropPosition(point: Coordinates, rect: DOMRect, offset?: Coordinates): Coordinates {
    let drop: Coordinates = this.getRelativeCoordinates(point, rect);

    return (offset) ? {
      x: drop.x - offset.x,
      y: drop.y - offset.y
    } : drop;
  }

  public getLocalCoordinates(drop: Coordinates, rect: DOMRect, offset: Coordinates, shouldSnapToGrid: boolean): Coordinates {
    let local: Coordinates = this.setDropPosition(drop, rect, offset);

    // TODO: Pass in the grid size as a part of the parent
    if (shouldSnapToGrid) local = snapToGridNearestVertex(DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE, local);

    return local;
  }

  public getRelativeCoordinates(absolute: Coordinates, rect: DOMRect): Coordinates {
    let { left, top, width, height } = rect;
    return {
      x: clamp(absolute.x - left, 0, width),
      y: clamp(absolute.y - top, 0, height)
    };
  }

  public clampCoordinates(coordinates: Coordinates, dimensions: Dimensions, rect: DOMRect): Coordinates {
    let { width, height } = rect;
    let { x, y } = coordinates;

    // console.log(`Container dimensions: ${width}, ${height}, element dimensions: ${JSON.stringify(dimensions)}\nPosition: ${JSON.stringify(position)}`);

    return {
      x: clamp(x, 0, width - dimensions.width),
      y: clamp(y, 0, height - dimensions.height)
    };
  }

  public getClampedCoordinates(drop: Coordinates, rect: DOMRect, offset: Coordinates, shouldSnapToGrid: boolean, dimensions: Dimensions): Coordinates {
    return this.clampCoordinates(
        this.getLocalCoordinates(drop, rect, offset, shouldSnapToGrid),
        dimensions,
        rect
      );
  }
}
