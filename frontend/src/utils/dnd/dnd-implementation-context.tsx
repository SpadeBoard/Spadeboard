import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DndItemProps, DroppableContainerProps} from './dnd-interfaces';
import {defaultHandleDragStart, defaultHandleDragEndNoOver, defaultHandleDragEndOnOver} from './dnd-utils';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core'; // Assuming you're using dnd-kit

// Define the context type
// Do I actually need this? I think I do
export interface DndImplementationContextType {
    dndItems: DndItemProps[];
    setDndItems?: React.Dispatch<React.SetStateAction<DndItemProps[]>>;
    droppableContainers: DroppableContainerProps[];
    setDroppableContainers?: React.Dispatch<React.SetStateAction<DroppableContainerProps[]>>;

    originalActiveZIndex?: number;
    setOriginalActiveZIndex?: React.Dispatch<React.SetStateAction<number>>;

    // God I'm gonna need to set z Index state in here too don't I
    handleDragStart?: (event: DragStartEvent) => void;
    handleDragEnd?: (event: DragEndEvent) => void;


    handleExtendedDragStart?: (event: DragStartEvent) => void;
    handleExtendedDragEnd?: (event: DragEndEvent) => void;

    handleExtendedDragEndNoOver?: (event: DragEndEvent) => void;
    handleExtendedDragEndOnSameActiveAndOver?: (event: DragEndEvent) => void;
    handleExtendedDragEndOnOver?: (event: DragEndEvent) => void;

    handleDndItemChildrenRender?: (
        id: string | number,
        isDraggable?: boolean,
        isDroppable?: boolean,
        type?: string,
        children?: React.ReactNode
    ) => React.ReactNode;
}




const dndItems: DndItemProps[] = [];
const droppableContainers: DroppableContainerProps[] = [];
const originalActiveZIndex: number = -1;

const defaultContextValue: DndImplementationContextType = {
    dndItems: dndItems,
    setDndItems: () => {}, // No-op function
    droppableContainers: droppableContainers,
    setDroppableContainers: () => {}, // No-op function
    originalActiveZIndex: originalActiveZIndex,
    setOriginalActiveZIndex: () => {}, // No-op function
    handleDragStart: () => {},
    handleDragEnd: () => {},
    handleDndItemChildrenRender: (id) => null // Default implementation
};

// Create the context
export const DndImplementationContext = createContext<DndImplementationContextType>(defaultContextValue);






// Define props for DndImplementationProvider
export interface DndImplementationProviderProps {
    dndItems: DndItemProps[];
    setDndItems: React.Dispatch<React.SetStateAction<DndItemProps[]>>;
    droppableContainers: DroppableContainerProps[];
    setDroppableContainers: React.Dispatch<React.SetStateAction<DroppableContainerProps[]>>;

    originalActiveZIndex: number;
    setOriginalActiveZIndex: React.Dispatch<React.SetStateAction<number>>;

    handleExtendedDragStart?: (event: DragStartEvent) => void;
    handleExtendedDragEnd?: (event: DragEndEvent) => void;

    handleExtendedDragEndNoOver?: (event: DragEndEvent) => void;
    handleExtendedDragEndOnSameActiveAndOver?: (event: DragEndEvent) => void;
    handleExtendedDragEndOnOver?: (event: DragEndEvent) => void;

    handleDndItemChildrenRender?: (
        id: string | number,
        isDraggable?: boolean,
        isDroppable?: boolean,
        type?: string,
        children?: React.ReactNode
    ) => React.ReactNode;

    children: ReactNode;
}

// Default provider component?
// Goddamn I'm dumb, this should be where the handleExtendedDragStart is
// But wait if I'm calling this as the default provider then wouldn't I need default dndItems
// Dear God help

// So check if there's an extended drag end then add it in the default provider, then in parent component implement it
// That's gonna require adding context value extending the default one and passing that in
// https://www.perplexity.ai/search/i-have-a-default-provider-for-GrK8._YeQ1C7WqXYQy9KZA
// Probably should rename this to OnDragEnd, or replace in DndContext handleDragStart and handleDragEnd with this

// Invalid hook call. Hooks can only be called inside of the body of a function component.
// EXPAND ON THIS


export const DndImplementationProvider: React.FC<DndImplementationProviderProps> = ({
    dndItems,
    setDndItems,

    droppableContainers,
    setDroppableContainers,

    originalActiveZIndex,
    setOriginalActiveZIndex,

    handleExtendedDragStart,
    handleExtendedDragEndNoOver,
    handleExtendedDragEndOnSameActiveAndOver,
    handleExtendedDragEndOnOver,

    handleDndItemChildrenRender,

    children
  }) => {
    // How the heck can I export handleDragStart and handleDragEnd when I have these dependencies
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeItem = dndItems.find((item: DndItemProps) => item.id === active.id);
    
        if (!activeItem) return;
    
        defaultHandleDragStart(active.id, dndItems, setDndItems, setOriginalActiveZIndex);
    
        if (handleExtendedDragStart)
            handleExtendedDragStart(event);
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
    
        // No draggable
        if (active === null)
            return;
    
        // Set the original z index, concerning that it keeps going up no matter what and there's gonna have to be a cap somewhere
        // Is done inside updateActiveItemLocation
        if (over === null) {
            defaultHandleDragEndNoOver(
                event,
                dndItems,
                setDndItems,
                originalActiveZIndex,
                setOriginalActiveZIndex);
    
            if (handleExtendedDragEndNoOver)
                handleExtendedDragEndNoOver(event);
    
            return;
        }
    
        // If something's both draggable and droppable, prevent it from being a child of itself?
        if (active.id === over.id) {
            console.log(`Dropped ${active.id} on itself.`);
    
            if (handleExtendedDragEndOnSameActiveAndOver)
                handleExtendedDragEndOnSameActiveAndOver(event);
    
            return;
        }
    
        defaultHandleDragEndOnOver(event, dndItems, droppableContainers, setDroppableContainers);
    
        if (handleExtendedDragEndOnOver)
            handleExtendedDragEndOnOver(event);
    };
    // EXPAND ON THIS
    
    // This should be fine because the only thing using this right now is dndBoard and it only needs these values
    const dndImplementationContextValue: DndImplementationContextType = {
        dndItems,
        droppableContainers,

        handleDragStart,
        handleDragEnd,

        handleDndItemChildrenRender,
    };

    return <DndImplementationContext.Provider value={dndImplementationContextValue}>{children}</DndImplementationContext.Provider>;
};

// Custom hook for the implementation
export const useDndImplementationContext = (): DndImplementationContextType => {
    const context = useContext(DndImplementationContext);
    if (context === undefined) {
        throw new Error('useDnd must be used within a DndImplementationProvider');
    }
    return context;
};