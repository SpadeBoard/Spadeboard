import { Injectable } from '@angular/core';
import { clamp, Coordinates, Dimensions } from '../../../../../../utils/utils';
import { CardPositionPerRoom } from '../../../../models/card';

@Injectable({
  providedIn: 'root'
})
export class CardPositionPerRoomManipulationService {

  private readonly MAX_ROTATION_DEGREE: number = 360;

  private overlaps: Map<string, CardPositionPerRoom[]> = new Map();

  // TODO: Replace screen position cache with just a style cache
  private screenPositionCache: Map<string, Coordinates> = new Map();

  constructor() { }

  /******************* ROTATION ***********************/ 
  // CHECKME: When it rotates 360, do we want to just set it to 0, since it's effectively the same position? 
  public canRotate(cpr: CardPositionPerRoom, direction: 'l' | 'r' = 'r'): boolean {
    switch (direction) {
      case 'l': {
        return cpr.dndItem.isRotatable && (cpr.dndRotation.degrees ?? 0) > -this.MAX_ROTATION_DEGREE;
      }
      case 'r': {
        return cpr.dndItem.isRotatable && (cpr.dndRotation.degrees ?? 0) < this.MAX_ROTATION_DEGREE;
      }
      default:
        throw new Error('Hate to say this, since this is 2d, you can\'t rotate up or down unfortunately');
    }
  }

  public rotateCardPositionPerRoom(degrees: number, cpr: CardPositionPerRoom): void {
    if (!cpr) return;

    cpr.dndRotation.degrees = clamp(cpr.dndRotation.degrees + degrees, -this.MAX_ROTATION_DEGREE, this.MAX_ROTATION_DEGREE);
  }
  /******************* ROTATION ***********************/

  /******************* OVERLAP ***********************/
  public getOverlappingAttributes(cpr: CardPositionPerRoom, rect: DOMRect): {
    coordinates: Coordinates;
    dimensions: Dimensions;
  } {
    if (!cpr) throw new Error("No card position per room");

    let coordinates: Coordinates = {
      x: cpr.dndPosition.x,
      y: cpr.dndPosition.y
    };

    if (!rect) throw new Error("Card position per room can't get back its own width and height!?");

    let dimensions: Dimensions = {
      width: rect.width,
      height: rect.height
    };

    return {
      coordinates,
      dimensions
    };
  }

  // FIXME: Why is this not culling correctly?
  public isRectContainedIn(
    innerRect: { coordinates: Coordinates, dimensions: Dimensions },
    outerRect: { coordinates: Coordinates, dimensions: Dimensions }
  ): boolean {
    return (
      innerRect.coordinates.x >= outerRect.coordinates.x &&
      innerRect.coordinates.x + innerRect.dimensions.width <= outerRect.coordinates.x + outerRect.dimensions.width &&
      innerRect.coordinates.y >= outerRect.coordinates.y &&
      innerRect.coordinates.y + innerRect.dimensions.height <= outerRect.coordinates.y + outerRect.dimensions.height
    );
  }

  // TODO: Refactor this, this is temporary overlap check
  // Here's the thing, what we actually really need is the precise size
  // Of the card itself, it would just be better to have it so that
  // If there's an overlap, we just 'hide the card', aka cull it
  // Especially since there's multiple cards that can be stacked on each other
  // Does that mean the z-index is unnecessary, I mean what we  can do is just
  // Have a z-index of -1, if indeed it is negative 1, don't render it?
  // That means that whenever the card moves, the overlapped card (-1) would have to shift up at least 1 index
  /******************** PARTIAL OVERLAP*************************/
  public getOverlappingBoundary(coordinate: Coordinates, distance: number): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    return {
      left: coordinate.x - distance,
      right: coordinate.x + distance,
      top: coordinate.y - distance,
      bottom: coordinate.y + distance
    }
  }

  public isInBoundary(
    coordinate: { x: number; y: number },
    boundary: { left: number; right: number; top: number; bottom: number }
  ): boolean {
    return (
      coordinate.x >= boundary.left &&
      coordinate.x <= boundary.right &&
      coordinate.y >= boundary.top &&
      coordinate.y <= boundary.bottom
    );
  }

  public isPartialOverlap(
    rect1: { coordinates: Coordinates, dimensions: Dimensions },
    rect2: { coordinates: Coordinates, dimensions: Dimensions }
  ): boolean {
    return (
      rect1.coordinates.x < rect2.coordinates.x + rect2.dimensions.width &&
      rect1.coordinates.x + rect1.dimensions.width > rect2.coordinates.x &&
      rect1.coordinates.y < rect2.coordinates.y + rect2.dimensions.height &&
      rect1.coordinates.y + rect1.dimensions.height > rect2.coordinates.y
    );
  }
  /******************** PARTIAL OVERLAP*************************/

  public addOverlapped(overlapper: string, overlapped: CardPositionPerRoom): void {
    let overlap: CardPositionPerRoom[] | undefined = this.overlaps.get(overlapper);

    if (overlap) {
      overlap.push(overlapped);
      return;
    }

    this.overlaps.set(overlapper, [overlapped]);
  }

  public cullOverlapped(overlapper: string, coordinates: Coordinates, dimensions: Dimensions, rect: DOMRect, unculled: CardPositionPerRoom[]) {
    let toCull: Set<string> = new Set();

    unculled.forEach((cpr: CardPositionPerRoom) => {
      // Skip card being moved
      if (cpr.cardPositionPerRoomId === overlapper) return;

      // TODO: Probably refactor this out of here
      /****************************************************************** */
      let attributes: {
        coordinates: Coordinates;
        dimensions: Dimensions;
      } = this.getOverlappingAttributes(cpr, rect);

      if (this.isRectContainedIn(
        {
          coordinates: attributes.coordinates,
          dimensions: attributes.dimensions
        },
        {
          coordinates: coordinates,
          dimensions: dimensions
        }
      )) {
        // FIXME: Why is it not actually culling these cards
        this.addOverlapped(overlapper, cpr);

        toCull.add(cpr.cardPositionPerRoomId);
      }
    })

    unculled = unculled.filter((c: CardPositionPerRoom) => !toCull.has(c.cardPositionPerRoomId));
  }
  /******************* OVERLAP ***********************/

  // NOTE: Just to make sure that they all have unique IDs
  // Because the issue is despite overlapping
  // They can share the same zIndex, so the order ends up being dependent on the DOM
  public normalizeZIndexes(cprs: CardPositionPerRoom[], globalZIndexCounter: number): void {
    // Use all cprs, not just unculled
    let sorted: CardPositionPerRoom[] = cprs.slice().sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((cpr, idx) => cpr.zIndex = idx);

    globalZIndexCounter = sorted.length + 1;
  }
}
