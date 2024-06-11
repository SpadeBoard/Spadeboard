import { ElementRef } from '@angular/core';
import { DndPosition } from '../models/dnd-types';

export function convertToRelativeCoordinates(
    viewportPoint: DndPosition,
    element: ElementRef<HTMLElement>,
    asPercentage?: boolean 
): DndPosition;
export function convertToRelativeCoordinates(
    viewportPoint: DndPosition,
    parentDimensions: {width: number, height: number},
    asPercentage?: boolean
): DndPosition;

export function convertToRelativeCoordinates(
    viewportPoint: DndPosition,
    dimensions: ElementRef<HTMLElement> | {width: number, height: number},
    asPercentage: boolean = true
): DndPosition {
    let relativeX: number = 0;
    let relativeY: number = 0;
    let width: number = 0;
    let height: number = 0;

    if (dimensions instanceof (ElementRef)) {
        // getBoundingClientRect is getting coordinates relative to the viewport
        // offset
        // client
        let rect = dimensions.nativeElement.getBoundingClientRect();

        // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
        relativeX = viewportPoint.x - rect.left;
        relativeY = viewportPoint.y - rect.top;
        width = rect.width; // TODO: Figure out which one's accurate
        height = rect. height; // TODO: Figure out which one's accurate

        // width = dimensions.nativeElement.offsetWidth;
        // height = dimensions.nativeElement.offsetHeight;

        /*
        offsetWidth and offsetHeight: Get the element's full size, including padding and border.
        clientWidth and clientHeight: Get the element's size, including padding but excluding border and scrollbars.
        getBoundingClientRect(): Returns a DOMRect object with properties like width, height, top, left, etc. It provides more precise, potentially fractional values and considers CSS transforms.
        */
        console.log(`getBoundingClientRect width: ${rect.width}, height: ${rect.height}
            \nClient width: ${dimensions.nativeElement.clientWidth}, height:  ${dimensions.nativeElement.clientHeight}
            \nOffset width: ${dimensions.nativeElement.offsetHeight}, height: ${dimensions.nativeElement.offsetHeight}`);
    }
    else
    {
        relativeX = viewportPoint.x;
        relativeY = viewportPoint.y;
        width = dimensions.width;
        height = dimensions.height;
    }

    if (asPercentage) {
        return {
            x: (relativeX / width) * 100,
            y: (relativeY / height) * 100
        };
    }

    return {
        x: relativeX,
        y: relativeY
    };
}

export function pageToLocalCoordinates(element: ElementRef<HTMLElement>, pageX: number, pageY: number, windowPageXOffset: number, windowPageYOffset: number): DndPosition {
    let rect = element.nativeElement.getBoundingClientRect();
    const localX = pageX - (rect.left + windowPageXOffset);
    const localY = pageY - (rect.top + windowPageYOffset);
    return { x: localX, y: localY };
}