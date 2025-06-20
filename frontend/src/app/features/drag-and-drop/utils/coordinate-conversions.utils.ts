/*
let dx = e.clientX - startPos.x;
let dy = e.clientY - startPos.y;
*/

import { Coordinates } from "../../../utils/utils";

// https://stackoverflow.com/questions/1892474/c-sharp-create-snap-to-grid-functionality
export function snapToGridNearestVertex(gridSize: number, d: Coordinates): Coordinates {
    //CHECKME: floor vs round
    return { 
        x: Math.round(d.x / gridSize) * gridSize,
        y: Math.round(d.y / gridSize) * gridSize
     };
};

export function snapToGridCellCentre(gridSize: number, dx: number, dy: number): { offsetX: number, offsetY: number } {
    let halfGridSize: number = gridSize / 2;

    let snappedX = ((dx + halfGridSize) / gridSize) * gridSize;
    let snappedY = ((dy + halfGridSize) / gridSize) * gridSize;

    return { offsetX: snappedX, offsetY: snappedY };
}