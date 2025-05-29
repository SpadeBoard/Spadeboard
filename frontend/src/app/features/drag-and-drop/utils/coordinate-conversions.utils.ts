/*
let dx = e.clientX - startPos.x;
let dy = e.clientY - startPos.y;
*/
// https://stackoverflow.com/questions/1892474/c-sharp-create-snap-to-grid-functionality
export function snapToGridNearestVertex(gridSize: number, dx: number, dy: number): { offsetX: number, offsetY: number } {
    let snappedX = Math.round(dx / gridSize) * gridSize;
    let snappedY = Math.round(dy / gridSize) * gridSize;//floor vs round

    return { offsetX: snappedX, offsetY: snappedY };
};

export function snapToGridCellCentre(gridSize: number, dx: number, dy: number): { offsetX: number, offsetY: number } {
    let halfGridSize: number = gridSize / 2;

    let snappedX = ((dx + halfGridSize) / gridSize) * gridSize;
    let snappedY = ((dy + halfGridSize) / gridSize) * gridSize;

    return { offsetX: snappedX, offsetY: snappedY };
}