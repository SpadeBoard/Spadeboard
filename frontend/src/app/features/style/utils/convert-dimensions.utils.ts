import { setAspectRatio } from "./aspect-ratio.utils";
import { parseCssDimension } from "./parse-css-dimensions.utils";

export function convertToRelativeDimensions(value: {width: string, height: string}): string {
    // Grab the value, parse it to get the numbers
    let x: number = parseCssDimension(value.width);
    let y: number = parseCssDimension(value.height);

    // Then find the aspect ratio, this should be fine and be relative
    return setAspectRatio(x, y);
}