export type DndPosition = {
    dndPositionId: string;
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