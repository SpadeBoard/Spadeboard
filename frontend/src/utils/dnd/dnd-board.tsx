import React, { useState, useEffect, useContext } from 'react';
import { DndContext, DragStartEvent, DragEndEvent } from '@dnd-kit/core';

import { getStandaloneContainees, addDraggableToDroppable } from './dnd-utils';

import { ActionContextMenuItem } from '../action-context-menu-item';

import { 
    DndBoardProps, DndItemProps, DroppableContainerProps, 
    DndDroppableContainerProps, DraggableAndDroppableProps} from './dnd-interfaces';

import { DndItem } from './dnd-item';
import { DndContaineeWithContent, DndStandaloneContainees } from './dnd-containee-with-content';

import { DndDroppableContainer } from './dnd-droppable-container';

import { DndImplementationContext, DndImplementationContextType, useDndImplementationContext } from './dnd-implementation-context';

 // This should genuinely be in DndBoards or another utility component
/*export const getContainerPairedWithContainee = (droppableContainers: DroppableContainerProps[], containeeId: string | number) => {
    return droppableContainers
        .filter(container => container.containeeId === containeeId) // Filter by containeeId
        .map(container => container.containerId); // Return the droppable of each matching container
};

export const getContaineePairedWithContainer = (droppableContainers: DroppableContainerProps[],containerId: string | number) => {
    return droppableContainers
        .filter(container => container.containerId === containerId) // Filter by containerId
        .map(container => container.containeeId); // Return the containeeId of each matching container
};*/

const DndBoard: React.FC<DndBoardProps> = React.memo(({
    children
    }) => {
    
    // They do exist as types DndImplementationContextType
    const {
        dndItems,
        droppableContainers,
        handleDragStart,
        handleDragEnd,
        handleDndItemChildrenRender
    } = useDndImplementationContext();
    // Set the original active item's Z index to what it originally was if there's no overlap
    // const [originalActiveZIndex, setOriginalActiveZIndex] = useState<number>(0);

    // Stores the amount of droppable containers here
    // Must have: id (for indexing all the droppable containers), containerId, containeeId
    // Essentially this should just be a 'bridge table'
    // Loop over this, group together all the draggable-ids with the matching droppable-ids
    // So those draggables are children of droppables, then go back to the dndItems, take the droppables, add those children

    // For the style, pass it in so you can customise it
    // If there is an action context menu, have the action context menu as a section

    // Specifically for rendering DndDroppableContainers with children
    // If there is an action context menu, have the action context menu as a section

    // For every item in dndItems
    // Check in droppableContainers if there's an id in there
    // If there isn't, then render
    // Else collect all the droppable container ids in droppableContainers, find the corresponding 

    // Something's wrong here, whenever a standlone containee becomes a child of a droppable container
    // DROPPABLE CONTAINER BECOMES DUPLICATED
    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* RENDER STANDLONE, NOT PLACED IN DROPPABLE ONLY, HOW CAN WE HAVE CHILDREN SLOT IN THEM*/}
                {/*Shit, a deck can be draggable*/}
                { 
                <DndStandaloneContainees
                    dndItems={dndItems}
                    droppableContainers={droppableContainers}
                    handleDndItemChildrenRender={handleDndItemChildrenRender}
                >
                    {children}
                </DndStandaloneContainees>}
            
                {/* 
                    Grab the droppables, filter dndItems based on whether isDroppable is true,
                    render those, and inside them, check to see if they have children
                */}
                <DndDroppableContainer 
                    dndItems={dndItems}
                    droppableContainers={droppableContainers} 
                    handleDndItemChildrenRender = {handleDndItemChildrenRender}
                >
                    {children}
                </DndDroppableContainer>
            </div>
        </DndContext>
    );
});

export default DndBoard;