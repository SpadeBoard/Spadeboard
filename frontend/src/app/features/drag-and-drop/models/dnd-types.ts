export type DndPosition = {
    dndPositionId: number;
    x: number;
    y: number;
}

export type DndDragBoundary = {
    dndDragBoundaryId?: number;
    width: string;
    height: string;
    maxWidth?: string;
    border?: string;
}