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

/*
To scale a child element to fit inside a parent element when both have pixel dimensions, you need to calculate the scaling factors for both width and height and apply the smaller of the two to maintain the aspect ratio. Here's the math:

### Formula
1. **Determine the scaling factors:**
   - $$ \text{Scale Width} = \frac{\text{Parent Width}}{\text{Child Width}} $$
   - $$ \text{Scale Height} = \frac{\text{Parent Height}}{\text{Child Height}} $$

2. **Choose the smaller scaling factor:**
   - $$ \text{Scale Factor} = \min(\text{Scale Width}, \text{Scale Height}) $$

3. **Calculate the new dimensions for the child:**
   - $$ \text{New Child Width} = \text{Child Width} \times \text{Scale Factor} $$
   - $$ \text{New Child Height} = \text{Child Height} \times \text{Scale Factor} $$

### Implementation Example in Angular
You can use these calculations in Angular by dynamically applying styles to scale the child element:

#### Component Logic (TypeScript)
```typescript
export class ParentComponent {
  parentWidth = 500; // Example parent width in pixels
  parentHeight = 300; // Example parent height in pixels
  childWidth = 800; // Example child width in pixels
  childHeight = 600; // Example child height in pixels

  getScaledDimensions() {
    const scaleWidth = this.parentWidth / this.childWidth;
    const scaleHeight = this.parentHeight / this.childHeight;
    const scaleFactor = Math.min(scaleWidth, scaleHeight);

    return {
      width: this.childWidth * scaleFactor,
      height: this.childHeight * scaleFactor,
    };
  }
}
```

#### Template (HTML)
```html

  
    Scaled Child
  

```

### Explanation
- The `getScaledDimensions()` method computes the new width and height of the child element based on the parent dimensions.
- The `min()` function ensures that the child fits entirely within the parent while maintaining its aspect ratio.

This approach ensures that the child element is resized proportionally to fit within its parent's dimensions.

Citations:
[1] https://www.reddit.com/r/angular/comments/1ffwt9i/populating_parent_div_with_portion_of_child/
[2] https://stackoverflow.com/questions/46855018/angular2-how-can-i-have-a-parent-component-tell-a-child-what-size-to-be
[3] https://stackoverflow.com/questions/1098219/how-to-make-child-divs-always-fit-inside-parent-div
[4] https://www.reddit.com/r/godot/comments/7i4nuv/parent_height_determined_by_child_height/
[5] https://forum.juce.com/t/set-width-of-parent-component-in-relation-to-their-child-component/41637
[6] https://github.com/FormidableLabs/resize-observer-experiments
[7] https://angular.io/guide/inputs-outputs
[8] https://graphviz.org/faq/
[9] https://css-tricks.com/using-css-transitions-auto-dimensions/

---
Answer from Perplexity: https://www.perplexity.ai/search/in-angular-i-m-trying-to-take-SI_I_5uIT4KR1Xo4hjvOvA?utm_source=copy_output
*/
export function convertToRelativeDimensions(childDimensions: {width: number, height: number}, parentDimensions: {width: number, height: number}, scaleFactor?: number) {
    if (scaleFactor !== undefined) 
    {
        return {
            x: childDimensions.width * scaleFactor,
            y: childDimensions.height * scaleFactor
        };
    }

    let scaleWidth = parentDimensions.width / childDimensions.width;
    let scaleHeight = parentDimensions.height / childDimensions.height;
    let calcScaleFactor = Math.min(scaleWidth, scaleHeight);

    return {
        x: childDimensions.width * calcScaleFactor,
        y: childDimensions.height * calcScaleFactor
    };

    /*return {
        x: (childDimensions.width / parentDimensions.width), // * 100,
        y: (childDimensions.height / parentDimensions.height) // * 100
    };*/
}

/*
let dx = e.clientX - startPos.x;
let dy = e.clientY - startPos.y;
*/
// https://stackoverflow.com/questions/1892474/c-sharp-create-snap-to-grid-functionality
export function snapToGridNearestVertex(gridSize: number, dx: number, dy: number): {offsetX: number, offsetY: number} {
    let snappedX = Math.round(dx / gridSize) * gridSize;
    let snappedY = Math.round(dy / gridSize) * gridSize;//floor vs round

    return { offsetX: snappedX, offsetY: snappedY };
};

export function snapToGridCentre( gridSize: number, dx: number, dy: number): {offsetX: number, offsetY: number}
    {
        let halfGridSize: number = gridSize/2;

        let snappedX = ( ( dx + halfGridSize  ) / gridSize  ) * gridSize;
        let snappedY = ( ( dy + halfGridSize ) / gridSize ) * gridSize;

        return { offsetX: snappedX, offsetY: snappedY };
    }