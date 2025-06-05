import { SafeUrl } from "@angular/platform-browser";

export function clamp(value: number, min: number, max: number): number {
    // console.log(`[CLAMP] value: ${value}, min: ${min}, max: ${max}`);

    if (min > max) throw new Error(`Invalid clamp range`);
    return Math.min(Math.max(value, min), max);
}

export async function safeUrlToBlob(safeUrl: SafeUrl): Promise<Blob | null> {
    try {
        let urlString = safeUrl.toString();
        let response = await fetch(urlString);
        let blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Error converting SafeUrl to Blob:', error);
        return null;
    }
}

export async function onLoadReadBlobAsBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Read the blob as a data URL
        reader.readAsDataURL(blob);

        // Handle successful reading
        reader.onloadend = () => {
            if (reader.result) {
                resolve(reader.result.toString());
            } else {
                reject('Failed to read blob as base64');
            }
        };

        // Handle errors
        reader.onerror = (error) => {
            reject(error);
        };
    });
}

export async function blobToDataURL(blobUrl: string): Promise<string> {
    let response = await fetch(blobUrl);
    let blob = await response.blob();
    return new Promise((resolve) => {
        let reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

// TODO: Refactor all these functions, probably should split them into smaller files
export function getScaledItemRenderDimensions(
  original: Dimensions,
  scale: number
): Dimensions {
  return {
    width: original.width * scale,
    height: original.height * scale
  };
}

export type Coordinates = {
    x: number;
    y: number;
}

export type Dimensions = {
    width: number;
    height: number;
}

export type Rect = {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

// https://www.geeksforgeeks.org/convex-hull-using-jarvis-algorithm-or-wrapping/
// https://en.wikipedia.org/wiki/Graham_scan
/*
let points be the list of points
let stack = empty_stack()

find the lowest y-coordinate and leftmost point, called P0
sort points by polar angle with P0, if several points have the same polar angle then only keep the farthest

for point in points:
    # pop the last point from the stack if we turn clockwise to reach this point
    while count stack > 1 and ccw(next_to_top(stack), top(stack), point) <= 0:
        pop stack
    push point to stack
end
*/

// https://www.geeksforgeeks.org/convex-hull-using-graham-scan/

// Function to compute orientation of the triplet (a, b, c)
// Returns -1 for clockwise, 1 for counter-clockwise, 0 for collinear
export function orientationFromCoordinates(a: Coordinates, b: Coordinates, c: Coordinates) {
    let v: number = a.x * (b.y - c.y) + 
              b.x * (c.y - a.y) + 
              c.x * (a.y - b.y);
    if (v < 0) return -1;  // clockwise
    if (v > 0) return +1;  // counter-clockwise
    return 0;              // collinear
}

export function orientationFromAngle(a: number) {
    if (a <0) return -1; // clockwise
    if (a > 0) return +1; // counter-clockwise
    return 0; // collinear
}

export function getPolarAngle(a: Coordinates, b: Coordinates): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

export function getDistanceSquared(a: Coordinates, b: Coordinates): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function sortByPolarAngle(coordinates: Coordinates[]): Coordinates[] {
   let p0: Coordinates = getMinCoordinates(coordinates);

    let others: Coordinates[] = coordinates.filter(c=> c !== p0);

    // Sort by polar angle, then by distance descending
    others.sort((a, b) => {
        let angleA: number = getPolarAngle(p0, a);
        let angleB: number = getPolarAngle(p0, b);

        if (angleA !== angleB) return angleA - angleB;
        return getDistanceSquared(p0, b) - getDistanceSquared(p0, a);
    });

    // Remove closer duplicates (keep only farthest for each angle)
    let unique: Coordinates[] = [];

    let lastAngle: number | null = null;
    for (const p of others) {
        let angle = getPolarAngle(p0, p);

        if (angle !== lastAngle) {
            unique.push(p);
            lastAngle = angle;
        }
    }

    return [p0, ...unique];
}

export function grahamScanAlgorithm(coordinates: Coordinates[]): Coordinates[] {
    let points: Coordinates[] = sortByPolarAngle(coordinates);
    let stack: Coordinates[] = [points[0]];

    points.forEach((point: Coordinates) => {
        while (stack.length > 1 && orientationFromCoordinates(points[points.length - 2], points[points.length - 1], point) <= 0) {
            stack.pop();
        }
        stack.push(point);
    });
    return points;
}

export function getMinCoordinates(coordinates: Coordinates[]): Coordinates {
    return {
        x: Math.min(...coordinates.map(c => c.x)),
        y: Math.min(...coordinates.map(c => c.y))
    };
}

export function getMaxCoordinates(coordinates: Coordinates[]): Coordinates {
    return {
        x: Math.max(...coordinates.map(c => c.x)),
        y: Math.max(...coordinates.map(c => c.y))
    };
}

// https://stackoverflow.com/questions/46335488/how-to-efficiently-find-the-bounding-box-of-a-collection-of-points#46336730
// https://stackoverflow.com/questions/19590865/from-an-array-of-objects-extract-value-of-a-property-as-array
export function getBoundingBox(coordinates: Coordinates[]): {
    min: Coordinates,
    max: Coordinates
} {
    return {
        min: getMinCoordinates(coordinates),
        max: getMaxCoordinates(coordinates)
    };
}

export function moveToFront(array: any[], index: number) {
  if (index > 0 && index < array.length) {
    let [item]: any = array.splice(index, 1);
    array.unshift(item);
  }
  return array;
}

export function moveToBack(array: any[], index: number) {
  if (index >= 0 && index < array.length) {
    let [item]: any = array.splice(index, 1);
    array.push(item);
  }
  return array;
}

export function getMidpoint(a: Coordinates, b: Coordinates): Coordinates {
    return {
        x: a.x + b.x /2,
        y: a.y + b.y /2
    }
}