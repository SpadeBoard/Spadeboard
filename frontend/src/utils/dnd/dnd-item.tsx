import { DndItemProps } from "./dnd-interfaces";
import { DraggableAndDroppable } from "./droppable-and-draggable";

// Ah, so here's gonna be the issue, dndItem takes in the style, so we need to pass in the associated style
export const DndItem: React.FC<DndItemProps> = ({
    id,
    isDraggable,
    isDroppable,
    position,
    zIndex,
    type,
    dndStyle,
    contextMenuItems,
    children, // Destructure children
    handleDndItemChildrenRender,
}) => {
    return (
        /*Draggable, pass style in there*/
        <DraggableAndDroppable
            key={id}
            id={id}
            isDraggable={isDraggable}
            isDroppable={isDroppable}
            position={position}
            zIndex={zIndex}
            dndStyle={dndStyle}
            contextMenuItems={contextMenuItems}
        >
            {/*Ok, something's wrong here*/}
            {children}
            {/*{handleDndItemChildrenRender && handleDndItemChildrenRender(id, isDraggable, isDroppable, type, children)}*/}
        </DraggableAndDroppable>
    );
};