import { useState, useEffect } from "react";
import { DndDroppableContainerProps } from "./dnd-interfaces";
import { getContaineePairedWithContainer, getDroppables, getContainers } from "./dnd-utils";

import { ActionContextMenuItem } from "../action-context-menu-item";
import { appendToContextMenuItems } from './actions-context-menu-utils';

import { DndItem } from "./dnd-item";
import { DndContaineeWithContent } from "./dnd-containee-with-content";

export const DndDroppableContainer: React.FC<DndDroppableContainerProps> = ({ dndItems, droppableContainers, children, handleDndItemChildrenRender }) => {
    return (
        <>
            {/* Render all container items, container are undefined */}
            {getContainers(dndItems, droppableContainers).map((container) => {
                let containerChildren: (string | number)[] = [];

                if (container)
                    containerChildren = getContaineePairedWithContainer(droppableContainers, container.id); // Get associated draggables

                // Calculate context menu items directly
                let contextMenuItems: ActionContextMenuItem[] = [];

                if (container.contextMenuItems) {
                    contextMenuItems = appendToContextMenuItems(contextMenuItems, container.contextMenuItems);
                }

                if (containerChildren.length > 0) {
                    const lastChildId = containerChildren[containerChildren.length - 1];
                    const lastChild = dndItems.find(item => item.id === lastChildId);

                    if (lastChild && lastChild.contextMenuItems) {
                        contextMenuItems = appendToContextMenuItems(contextMenuItems, lastChild.contextMenuItems);
                    }
                }

                // Log the context menu items (if needed)
                // console.log(`Droppable container with draggable children context menu items: ${JSON.stringify(contextMenuItems)}`);

                return (
                    <DndItem
                        key={container.id}
                        id={container.id}
                        isDraggable={container.isDraggable}
                        isDroppable={container.isDroppable}
                        position={container.position}
                        zIndex={container.zIndex}
                        type={container.type}
                        dndStyle={container.style}
                        contextMenuItems={contextMenuItems}
                        handleDndItemChildrenRender={handleDndItemChildrenRender}
                    >
                        {/* Render child items if they exist */}
                        {containerChildren.map((childId) => {
                            const childItem = dndItems.find((child: { id: string | number; }) => child.id === childId);
                            
                            return childItem ? (
                                <DndContaineeWithContent
                                    key={childId}
                                    id={childId}
                                    isDraggable={childItem.isDraggable}
                                    isDroppable={childItem.isDroppable}
                                    position={childItem.position}
                                    zIndex={childItem.zIndex + 1}
                                    type={childItem.type}
                                    dndStyle={childItem.style}
                                    handleDndItemChildrenRender={handleDndItemChildrenRender}
                                >
                                    {/* Render the children of the draggable items*/}
                                    {children}
                                </DndContaineeWithContent>
                            ) : null;
                        })}
                    </DndItem>
                );
            })}
        </>
    );
};