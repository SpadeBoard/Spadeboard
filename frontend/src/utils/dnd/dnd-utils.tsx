import React, {useState, useCallback} from "react";
import { DroppableContainerProps, DndItemProps } from "./dnd-interfaces";
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

export const getContainerPairedWithContainee = (droppableContainers: DroppableContainerProps[], containeeId: string | number) => {
    return droppableContainers
        .filter(container => container.containeeId === containeeId) // Filter by containeeId
        .map(container => container.containerId); // Return the droppable of each matching container
};

export const getContaineePairedWithContainer = (droppableContainers: DroppableContainerProps[],containerId: string | number) => {
    return droppableContainers
        .filter(container => container.containerId === containerId) // Filter by containerId
        .map(container => container.containeeId); // Return the containeeId of each matching container
};

export const getStandaloneContainees = (dndItems: DndItemProps[], droppableContainers: DroppableContainerProps[]): DndItemProps[] => {
    return dndItems.filter(item => 
        !droppableContainers.some(container => container.containeeId === item.id)
    );
};

export const getContainers = (dndItems: DndItemProps[], droppableContainers: DroppableContainerProps[]): DndItemProps[] => {
    return dndItems.filter(item => 
        droppableContainers.some(container => container.containerId === item.id)
    );
}

export const getDroppables = (dndItems: DndItemProps[]): DndItemProps[] => {
    // If something's both draggable and droppable, it's gonna accidentally render twice
    return dndItems.filter(item => item.isDroppable && !item.isDraggable);
};

export const pairDraggableToDroppable = (
    activeId: string | number,
    activeZIndex: number,
    overId: string | number,
    activePosition: { x: number | null; y: number | null },
    setDroppableContainers: React.Dispatch<React.SetStateAction<DroppableContainerProps[]>>)
    : void => {

    // So modify this so that you grab the z index of previous draggables paired with that same droppable
    // Find the highest z index, add 1 to that for the new one
    if (overId && activeId !== overId) {
        // Update the droppable container state by adding the active item
        setDroppableContainers(prevContainer => {
            // Create a new array that includes all previous items and adds the active item
            return [...prevContainer, { containerId: overId, containeeId: activeId, position: activePosition, zIndex: activeZIndex }];
        });
    }
}

export function addDraggableToDroppable(activeId: string | number, overId: string | number, activePosition: { x: number | null, y: number | null }, dndItems: DndItemProps[], droppableContainers: DroppableContainerProps[], setDroppableContainers: React.Dispatch<React.SetStateAction<DroppableContainerProps[]>>): void {
    // Essentially if there's already a droppable container with an associated droppable and draggable
    // No need to add draggable as a child of droppable

    // Currently this is kind of screwed up if something's both draggable and droppable because active is draggable and over is droppable
    // Temporarily handles by disabling draggability on all things not being dragged
    if (droppableContainers.find(item => item.containeeId === activeId))
        return;

    const activeItem = dndItems.find((item: { id: string | number; }) => item.id === activeId);

    if (activeItem && activePosition)
        pairDraggableToDroppable(activeId, activeItem.zIndex, overId, activePosition, setDroppableContainers);
}

export const defaultHandleDragStart = (
    activeId: string | number, 
    dndItems: DndItemProps[], 
    setDndItems: React.Dispatch<React.SetStateAction<DndItemProps[]>>,
    setOriginalActiveZIndex: React.Dispatch<React.SetStateAction<number>>
) => {
    const highestZIndex = Math.max(...dndItems.map((item: DndItemProps) => item.zIndex));

    const activeItem = dndItems.find((item: DndItemProps) => item.id === activeId);

    if (activeItem)
        setOriginalActiveZIndex((previousZIndex: number) => activeItem.zIndex);

    // Why is the id for DraggableAndDroppable undefined

    // Create a new array with the updated item
    setDndItems(prevItems => prevItems.map((item: DndItemProps) => 
        item.id === activeId ? { ...item, zIndex: Math.max(...prevItems.map(i => i.zIndex)) + 1 } : item
    ));
}

// Wait, what the heck am I doing here?
// This is for NoOver, this should just be the default handle drag
export const defaultHandleDragEndNoOver = (
    event: DragEndEvent,
    dndItems: DndItemProps[],
    setDndItems: React.Dispatch<React.SetStateAction<DndItemProps[]>>,
    originalActiveZIndex: number,
    setOriginalActiveZIndex: React.Dispatch<React.SetStateAction<number>>) => {

    const {active} = event;

    // If there's no overlap

    const activeItem = dndItems.find((item: { id: string | number; }) => item.id === active.id);

    // Draggable item should be able to be placed in a new location
    const activeItemIndex = dndItems.findIndex((item: DndItemProps) => item.id === active.id);
    updateActiveItemLocation(setDndItems, originalActiveZIndex, activeItemIndex, event);

    // Wait, why doesn't this change?
    // Crap, dndItems and droppableContainers really shouldn't be states, should they
    console.log(`Active position - X ${activeItem?.position.x}, Y: ${activeItem?.position.y}`);

    // No ZIndex should ever be below 0 so this is default state
    if (activeItem)
        setOriginalActiveZIndex((previousZIndex: number) => -1);
}

export function updateActiveItemLocation(setDndItems: React.Dispatch<React.SetStateAction<DndItemProps[]>>, originalActiveZIndex: number, activeItemIndex: number, event: DragEndEvent): void {
    // Update the location
    if (activeItemIndex === -1) return;

    setDndItems((prevItems: DndItemProps[]) => prevItems.map((item: DndItemProps, index: number) => {
        if (index !== activeItemIndex) return item;

        const newX = item.position.x + event.delta.x;
        const newY = item.position.y + event.delta.y;

        console.log(`Active position - X ${item.position.x}, Y: ${item.position.y}, Event delta - X: ${event.delta.x} Y: ${event.delta.y}`);

        // This is going to need to be modified
        // I don't think we need to set the style here?
        // Or we set the style inside of DraggableAndDroppable

        // Yea, no gotta remove here, for some reason it screws up if we don't have the combined style
        return {
            ...item,
            zIndex: originalActiveZIndex,
            position: { x: newX, y: newY },
            /*...(item.style && {
                style: {
                    ...item.style,
                    left: `${newX}px`,
                    top: `${newY}px`,
                }
            })*/
        };
    }));
}

export const defaultHandleDragEndOnOver = (
    event: DragEndEvent,
    dndItems: DndItemProps[],
    droppableContainers: DroppableContainerProps[],
    setDroppableContainers: React.Dispatch<React.SetStateAction<DroppableContainerProps[]>>,
) => {
    const {active, over} = event;

    if (over === null || over.id === null)
        return;

    // So it's not actually doing anything with activePosition here, however it's still gonna go to DraggableAndDroppable and update the style there
    // Which is why it's screwy
    let activeRect = active.rect.current; // Access the current rect
    let activeX = activeRect?.translated ? activeRect.translated.left + (activeRect.translated.width / 2) : null;
    let activeY = activeRect?.translated ? activeRect.translated.top + (activeRect.translated.height / 2) : null;

    let activePosition = { x: activeX, y: activeY };

    addDraggableToDroppable(active.id, over.id, activePosition, dndItems, droppableContainers, setDroppableContainers);

    setDroppableContainers(newDroppableContainers => {
        console.log("DEFAULT HANDLE DRAG END ON OVER");
        newDroppableContainers.forEach((container) => {
            console.log(`Container: ${container.containerId}, Containee: ${container.containeeId}`);
            console.log(JSON.stringify(container, null, 2));
        });
        return newDroppableContainers;
    });
}

export const onToggleDraggability = (setDndItems: React.Dispatch<React.SetStateAction<DndItemProps[]>>, id: string | number): void => {
    setDndItems((prevItems: DndItemProps[]) => {
        let item: DndItemProps | undefined = prevItems.find((item) => (item.id === id));

        if (item)
            item.isDraggable = !item.isDraggable

        return prevItems;
    });
}

export const onToggleDroppability = (setDndItems: React.Dispatch<React.SetStateAction<DndItemProps[]>>, id: string | number): void => {
    setDndItems((prevItems: DndItemProps[]) => {
        let item: DndItemProps | undefined = prevItems.find((item) => (item.id === id));

        if (item)
            item.isDroppable = !item.isDroppable;

        return prevItems;
    });
}

function useDndStyle(newDndStyle: React.CSSProperties): readonly [React.CSSProperties, (modifier: (prevStyle: React.CSSProperties) => React.CSSProperties) => void] {
    const [dndStyle, setDndStyle] = useState<React.CSSProperties>(newDndStyle);

    const setStyle = useCallback((modifier: (prevStyle: React.CSSProperties) => React.CSSProperties) => {
        setDndStyle(prevStyle => modifier(prevStyle));
    }, []);

    // It froze on me
    return [dndStyle, setStyle] as const;
}

// This should be for settings the specific styles you want to use
// And then inside of the place where you use the styles
// make a new array which contains the id for the dndItem as well as the style associated with it
// Make sure that you will always have 1 style per dndItem, no more

// https://www.perplexity.ai/search/in-react-when-you-make-a-custo-Tz.Je3KRSQeF4ZetwRoOCg
function useDynamicStyles() {
    const [styles, setStyles] = useState<{ [key: string]: React.CSSProperties }>({});

    const addStyle = useCallback((key: string, style: React.CSSProperties) => {
        setStyles(prevStyles => ({
            ...prevStyles,
            [key]: style
        }));
    }, []);

    const removeStyle = useCallback((key: string) => {
        setStyles(prevStyles => {
            const newStyles = { ...prevStyles };
            delete newStyles[key];
            return newStyles;
        });
    }, []);

    const modifyStyle = useCallback((key: string, modifier: (prevStyle: React.CSSProperties) => React.CSSProperties) => {
        setStyles(prevStyles => ({
            ...prevStyles,
            [key]: modifier(prevStyles[key] || {})
        }));
    }, []);

    return { styles, addStyle, removeStyle, modifyStyle };
}