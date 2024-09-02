import DndCardBoard from '../../components/card-system/card-dnd/card-dnd-board';


// https://www.npmjs.com/package/react-intersection-observer
// Probably should use this package instead of the built in IO

/* 
export interface DndBoardImplementation {
    // This is apaprently pretty unusual
    dndItems: DndItemProps[];
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
    ) => React.ReactNode;
}
*/

// Ultimately the goal is to take information from the dndCardBoard and then serialize it and save it in the database
// The thing is that this room function's gonna have to hold things like the nav bar and so we need to pull up the dndCardBoard information somehow
// Then pass it down again into the component that handles saving.
function GameRoom() {
    return (
        <div>
          <DndCardBoard/>
        </div>
      );
}

export default GameRoom;