import React, { useMemo } from "react";
import { DndItemProps, DndStandloneContaineesProps } from "./dnd-interfaces";
import { DndItem } from "./dnd-item";
import { getStandaloneContainees } from "./dnd-utils";

export const DndStandaloneContainees: React.FC<DndStandloneContaineesProps> = ({
    children,
    handleDndItemChildrenRender,
    dndItems,
    droppableContainers,
}) => {
    const standaloneContainees = useMemo(() =>
        getStandaloneContainees(dndItems, droppableContainers),
        [dndItems, droppableContainers]
    );

    return (
        <>
            {standaloneContainees.map((standaloneContainee) => {
                // console.log(`Standalone containee: ${standaloneContainee.id}`);

                return (
                    <DndContaineeWithContent
                        key={standaloneContainee.id}
                        id={standaloneContainee.id}
                        isDraggable={standaloneContainee.isDraggable}
                        isDroppable={standaloneContainee.isDroppable}
                        position={standaloneContainee.position}
                        zIndex={standaloneContainee.zIndex}
                        type={standaloneContainee.type}
                        dndStyle={standaloneContainee.style}
                        contextMenuItems={standaloneContainee.contextMenuItems}
                        handleDndItemChildrenRender={handleDndItemChildrenRender}
                    >
                        {children}
                    </DndContaineeWithContent>
                );
            })}
        </>
    );
};

export const DndContaineeWithContent: React.FC<DndItemProps> = ({
    id,
    isDraggable,
    isDroppable,
    position,
    zIndex,
    type,
    dndStyle,
    contextMenuItems,
    children,
    handleDndItemChildrenRender,
}) => {
    const filteredChildren = useMemo(() =>
        React.Children.toArray(children).filter(child =>
            React.isValidElement(child) && child.props.dndItemId === id
        ),
        [children, id]
    );

    // Alright, I think we need the styles array
    // Grab the associated style based on the id of the dndItem as a key, then pass that in
    // But what about updating the style itself

    return (
        <DndItem
            key={id}
            id={id}
            isDraggable={isDraggable}
            isDroppable={isDroppable}
            position={position}
            zIndex={zIndex}
            type={type}
            dndStyle={dndStyle}
            contextMenuItems={contextMenuItems}
            handleDndItemChildrenRender={handleDndItemChildrenRender}
        >
            {filteredChildren.length > 0 ? filteredChildren : null}
        </DndItem>
    );
};