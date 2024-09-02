import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Transform } from '@dnd-kit/utilities';

import { ActionContextMenuItem } from '../action-context-menu-item';

export interface s {
    // Need to have transform be modifiable here, has to have value: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined;
    tf?: Transform;
    // Left and top
    l?: string;
    t?: string;
}

// Draggable - Items that are draggable, should be in the dndItems main array
// Droppable - Items that are standalone and can be dropped onto, not a DroppableContainer which is an array
// DroppableContainers - List of droppable containers

// dndItems are based on DraggableAndDroppableProps, must have id, isDraggable, isDroppable, zIndex, and position
// Have dndItems be the main array for all items that aren't part of a DroppableContainer
// Ids should be ${dndItems.length}-${Date.Now()}
export interface DraggableAndDroppableProps {
    id: string | number;
    children?: React.ReactNode;
    isDraggable?: boolean;
    isDroppable?: boolean;
    position: { x: number; y: number };
    zIndex?: number;
    dndStyle?: React.CSSProperties;
    contextMenuItems?: ActionContextMenuItem[];
}

export interface DroppableContainerProps {
    containerId: string | number; // Container - Over
    containeeId: string | number; // Component to place into - Active
    position: { x: number | null; y: number | null };
    zIndex: number;
}

export interface DndBoardProps {
    /*dndItems: DndItemProps[];
    setDndItems: React.Dispatch<React.SetStateAction<DndItemProps[]>>;
    droppableContainers: DroppableContainerProps[];
    setDroppableContainers: React.Dispatch<React.SetStateAction<DroppableContainerProps[]>>;

    handleExtendedDragStart: (event: DragStartEvent) => void;
    handleExtendedDragEnd: (event: DragEndEvent) => void;
    handleDndItemChildrenRender: (
        id: string | number,
        isDraggable?: boolean,
        isDroppable?: boolean,
        type?: string,
        children?: React.ReactNode
    ) => React.ReactNode;*/

    children?: React.ReactNode;
}

export interface DndItemChildrenProps {
    dndItemId: string | number;
}

export interface DndItemProps extends DraggableAndDroppableProps {
    type: string; // Add type property to display item type
    children?: React.ReactNode;

    id: string | number;
    isDraggable: boolean;
    isDroppable: boolean;
    zIndex: number;
    position: { x: number; y: number };
    style?: React.CSSProperties; // Optional style property
    contextMenuItems?: ActionContextMenuItem[];

    standaloneDraggableChildren?: Array<React.FC>;

    handleDndItemChildrenRender?: (id: string | number, isDraggable?: boolean, isDroppable?: boolean, type?: string, children?: React.ReactNode) => React.ReactNode;
}

export interface DndStandloneContaineesProps {
    dndItems: DndItemProps[];
    droppableContainers: DroppableContainerProps[];
    children?: React.ReactNode;
    handleDndItemChildrenRender?: (id: string | number, isDraggable?: boolean, isDroppable?: boolean, type?: string, children?: React.ReactNode) => React.ReactNode;
}

export interface DndDroppableContainerProps {
    dndItems: DndItemProps[];
    droppableContainers: DroppableContainerProps[];
    children?: React.ReactNode;
    handleDndItemChildrenRender?: (id: string | number, isDraggable?: boolean, isDroppable?: boolean, type?: string, children?: React.ReactNode) => React.ReactNode;
}






// This should probably be deleted
export interface DndBoardImplementation {
    // This is apaprently pretty unusual
    dndItems?: DndItemProps[];
    setDndItems?: React.Dispatch<React.SetStateAction<DndItemProps[]>>;
    droppableContainers?: DroppableContainerProps[];
    setDroppableContainers?: React.Dispatch<React.SetStateAction<DroppableContainerProps[]>>;

    handleExtendedDragStart?: (event: DragStartEvent) => void;
    handleExtendedDragEnd?: (event: DragEndEvent) => void;
    handleDndItemChildrenRender?: (
        id: string | number, 
        isDraggable?: boolean, 
        isDroppable?: boolean, 
        type?: string, 
        children?: React.ReactNode
    ) => React.ReactNode;
}