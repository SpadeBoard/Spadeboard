import React, { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

import ActionsContextMenu from './actions-context-menu';

import { DraggableAndDroppableProps, s} from './dnd-interfaces';

// Styling template

// This should be all that's needed because ultimately you're just adding ids of droppables and draggables

// If it's a droppable container, then use handleDragEnd

// TypeError: Cannot destructure property 'id' of 'undefined' as it is undefined.
export function DraggableAndDroppable({
    id,
    children,
    isDraggable = true,
    isDroppable = true,
    position,
    zIndex = 0,
    dndStyle,
    contextMenuItems,
}: DraggableAndDroppableProps): JSX.Element {
    const draggableData = isDraggable
        ? useDraggable({ 
            id: id,
            // disabled: !isDraggable
        })
        : { attributes: {}, listeners: {}, setNodeRef: () => { }, transform: null };

    const droppableData = isDroppable
        ? useDroppable({ 
            id: id, 
            // disabled: !isDroppable 
        })
        : { isOver: false, setNodeRef: () => { } };

    const {
        attributes,
        listeners,
        setNodeRef: setDraggableRef,
        transform
    } = draggableData;

    const { isOver, setNodeRef: setDroppableRef } = droppableData;

    // Combine the refs
    // Something has to be going on here, set draggable to false makes it disappear, I think that's what's going on here
    const setNodeRef = React.useCallback((node: HTMLDivElement | null) => {
        if (isDraggable) setDraggableRef(node);
        if (isDroppable) setDroppableRef(node);
    }, [isDraggable, isDroppable, setDraggableRef, setDroppableRef]);

    // Style should be passable
    // I need to somehow use transform because that's what's showing the movement in real time
    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        backgroundColor: isOver ? 'lightblue' : undefined,
        padding: '10px',
        margin: '5px',
        border: '1px solid black',
        cursor: isDraggable ? 'move' : 'default',
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'relative',
        zIndex: `${zIndex}`,
        width: 'fit-content',
        height: 'fit-content',
    };

    // State to manage the visibility of the context menu
    // Problem is that it's pretty much a singleton

    // Uncaught Error: Should have a queue. This is likely a bug in React. Please file an issue.
    // How is this causing it though?
    const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);

    // Why does this work? Also, you should just be able to detect whether the menu's being clicked versus the dnd
    const handleContextMenu = (e: any): void => {
        e.preventDefault();
        e.stopPropagation();

        if (!isContextMenuOpen) {
            setIsContextMenuOpen(true);
            setDisableDnd(true);

            console.log(`Open ${id} context menu`);
        }
        else {
            setIsContextMenuOpen(false);
            setDisableDnd(false);

            console.log(`Close ${id} context menu`);
        }
    };

    // Combine styles and modify specific properties so I can actually use transform properly
    // When cards are children of decks, it's going to be definitely affected by this too
    // Wouldn't this override whatever I set originally

    // So the card isn't beocming the child of the deck, how the heck is it actually overlapping then and moving under it?
    const combinedStyle: React.CSSProperties = {
        ...dndStyle, // Spread existing dndStyle

        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        // cursor: isDraggable ? 'move' : 'default',
        left: `${position.x}px`, // Ah so this is the issue, it seems
        top: `${position.y}px`, // Yea no, this needs to be passed so that the dndItem handles the positioning, whether it's % or px based is up to it, not here
        zIndex: zIndex,
    };

    // Disable Dnd while the context menu is open
     // Uncaught Error: Should have a queue. This is likely a bug in React. Please file an issue.
    const [disableDnd, setDisableDnd] = useState<boolean>(false);

    /*
    React has detected a change in the order of Hooks called by DraggableAndDroppable. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
    1. useMemo                    useMemo
    2. useContext                 useContext
    3. useContext                 useRef
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    at DraggableAndDroppable (http://localhost:3000/src/utils/dnd/droppable-and-draggable.tsx?t=1727118758197:17:41)
    at DndItem (http://localhost:3000/src/utils/dnd/dnd-item.tsx?t=1727118758197:11:27)
    at DndContaineeWithContent (http://localhost:3000/src/utils/dnd/dnd-containee-with-content.tsx?t=1727120176465:41:43)
    at DndStandaloneContainees (http://localhost:3000/src/utils/dnd/dnd-containee-with-content.tsx?t=1727120176465:14:43)
    at div
    at DndContext2 (http://localhost:3000/node_modules/.vite/deps/@dnd-kit_core.js?v=d9f4a8ae:2731:5)
    at http://localhost:3000/src/utils/dnd/dnd-board.tsx?t=1727120458547:28:62
    at DndCardBoard (http://localhost:3000/src/components/card-system/test/card-dnd-board.tsx?t=1727120458547:20:49)
    at App
    */
    return (
        <div
            ref={setNodeRef}
            style={
                (dndStyle) ? combinedStyle : style} 
                {...(disableDnd ? {} : attributes)}
                {...(disableDnd ? {} : listeners)}
            onContextMenu={handleContextMenu}
        >
            {/*I wonder if something's being lost after it gets here because it's certainly not containing the values of the card*/}
            {children}

            {/*Why is it that when you click on the context menu, it gets overriden by the droppable and draggable and how do we prevent that. Setting z index doesn't work*/}
            {isContextMenuOpen && (<ActionsContextMenu
                contextMenuItemsId={`${id}-context-menu`}
                contextMenuItems={contextMenuItems}
                // isContextMenuOpen={isContextMenuOpen}
                setIsContextMenuOpen={setIsContextMenuOpen}
                zIndex = {zIndex}
            />)}
        </div>
    );
}