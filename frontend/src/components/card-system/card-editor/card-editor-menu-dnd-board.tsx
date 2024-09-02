import { useState, useCallback, useRef } from "react";

import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

import { DndItemProps, DroppableContainerProps } from "../../../utils/dnd/dnd-interfaces";

import { DndImplementationProvider } from '../../../utils/dnd/dnd-implementation-context';
import DndBoard from "../../../utils/dnd/dnd-board";
import Card from "../card-functionality/card";

import { CardEditorTextAreaProps } from "./card-editor-interface";
import CardEditorTextArea from "./card-editor-textarea";

import './card-editor-menu-dnd-board.css';

import { cardDraggableStyle, CardStyleParams } from "../card-dnd/card-dnd-board";

import { ActionContextMenuItem } from '../../../utils/action-context-menu-item'; // Assuming this is where your item type is defined

import { onToggleDraggability } from "../../../utils/dnd/dnd-utils";

interface DndCardEditorMenuBoardProps {
    cardId?: string | number;
    onClose: () => void;
}

interface TextAreaDraggableStyleProps {
    position: {x: number, y: number};
    zIndex: number;
  }

interface CardTemplateStyleParams extends CardStyleParams {
    containerType?: string;
}

export const cardTemplateStyle = ({
    position = { x: 0, y: 0 },
    isOver = false,
    isDragging = false,
    isInDeck = false,
    zIndex = 0,
    // transform = null,
    width/*'fit-content'*/,
    height/*'fit-content'*/,
    backgroundColor = 'white'
}: CardTemplateStyleParams = {}): React.CSSProperties => {
    return {
        position: 'absolute',
        top: `${position.y}`,
        left: `${position.x}`,
        width,
        height,
        backgroundColor: isOver ? 'lightblue' : backgroundColor,
        border: '1px solid #000',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        // transition: isDragging ? 'none' : 'transform 0.3s',
        cursor: isInDeck ? 'default' : 'grab',
        touchAction: 'none',
        zIndex,
        overflow: 'visible',
        containerType: 'inline-size'
        // transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    };
};

export const textAreaDraggableStyle = ({
    position,
    zIndex,
}: TextAreaDraggableStyleProps): React.CSSProperties => {
    return {
        position: 'absolute',
        top: `${position.y}`,
        left: `${position.x}`,
        width: 'fit-content', // fit-content ain't gonna work since there's no children
        height: 'fit-content', // fit-content ain't gonna work since there's no children
        border: '1px solid #000',
        borderRadius: '10px', // I hopped back out and hopped back in, it froze on me, there's someone else in the queue, feel free to kick me out and help them, if you can see this message
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        touchAction: 'none',
        zIndex,
        maxWidth: '100%',
        maxHeight:'100%',
        padding: '5px',
        backgroundColor: '#f0f0f0',
    };
};

// Figure out how to make it so that everything that uses Dnd has to apply an interface where it has
// dndItems, setDndItems, styles, setStyles, activeZIndex, setActiveZIndex, droppableContainers, setDroppableContainers, handleExtendedDragStart, and handleExtendedDragEndOnOver

// Have a default card style that can be used here and there
const DndCardEditorMenuBoard: React.FC<DndCardEditorMenuBoardProps> = ({ cardId, onClose }) => {
    // Gonna need this to modify styling, otherwise you get errors based on the fact you only have a getter
    const [styles, setStyles] = useState<{ [key: string]: React.CSSProperties }>({});

    // All children of dndItems that will be added like input and image must have a dndItemId
    const [dndItems, setDndItems] = useState<DndItemProps[]>([
        /*{
            id: `textarea-${Math.random()}-${Date.now()}`,
            type: 'textarea',
            isDraggable: true,
            isDroppable: false,
            zIndex: 0,
            position: { x: 0, y: 0 }
        },
        {
            id: `image-${Math.random()}-${Date.now()}`,
            type: 'image',
            isDraggable: true,
            isDroppable: false,
            zIndex: 0,
            position: { x: 150, y: 700 }
        },*/
        {
            id: 'Card Template',
            type: 'card',
            isDraggable: false,
            isDroppable: true,
            zIndex: 10,
            position: { x: 150, y: 0 },
            get style() {
                return cardTemplateStyle({
                    position: this.position,
                    zIndex: this.zIndex,
                    width: '40%',
                    height: `100%`,
                });
            },
        },
    ]);

    const cardTemplateRef = useRef(null);

    // For some reason it's creating a new card when you add a new text area

    // The container should be the 1 card and then the inputs, image or whatever
    // Have the user be able to change the card's name
    // Grab id of the card, if no card id then generate a blank card
    const [droppableContainers, setDroppableContainers] = useState<DroppableContainerProps[]>([
    ]);

    const [originalActiveZIndex, setOriginalActiveZIndex] = useState<number>(-1);

    const [cardEditorTextAreaProps, setCardEditorTextAreaProps] = useState<CardEditorTextAreaProps[]>([]);

    const textAreaContextMenuItems: ActionContextMenuItem[] = [
        {
            name: 'Lock',
            onClick: (id: string | number) => onToggleLock(id), // This is causing issues, why
        },
    ];

    const onToggleLock = (id: string | number): void => {
        onToggleDraggability(setDndItems, id);
    }

    // Grab dndItems, add a new dndItem
    // Modify droppable containers so that containerId is the cardDndItem and containeeId is the input dndItem
    const addDndChildToDndCardTemplate = (dndItemId: string | number, cardTemplateId: string | number): void => {
        // Split the id on the dash to separate between the date
        let newDndItemType: string = (dndItemId as string).split('-')[0];

        // Problem, there is no styling for the textarea dnd Item
        // Gonna have to make it, probably gonna need to make sure that the width and height fits content and that's it
        // Make an outline just to make sure it exists
        setDndItems(prevItems => [
            ...prevItems,
            {
                id: dndItemId,
                type: newDndItemType, 
                isDraggable: true, // This interferes with the resizing ability, must toggle on and off to resize properly
                isDroppable: false,
                position: { x: 0, y: 0 }, // Temporary
                zIndex: 12, //Temporary, have it be zIndex of the board + 2
                get style() {
                    return textAreaDraggableStyle({
                        position: this.position,
                        zIndex: this.zIndex,
                    });
                },
                contextMenuItems: textAreaContextMenuItems
            }
        ]);

        setDroppableContainers(prevDroppableContainers => [
            ...prevDroppableContainers,
            {
                containerId: cardTemplateId,
                containeeId: dndItemId,
                position: { x: 0, y: 0 }, // Temporary
                zIndex: 1, //Temporary, have it be zIndex of the board + 2
            }
        ]);
    }

    const createTextArea = (): void => {
        let dndItemId: string | number = `textarea-${new Date}`;
        let cardTemplateId: string | number = '';

        setDndItems(prevDndItems => {
            // Get the most up-to-date first item
            cardTemplateId = prevDndItems[0]?.id;
            // Return the previous state unchanged, as addDndChildToDndCardTemplate
            // will handle the actual state update
            return prevDndItems;
        });

        addDndChildToDndCardTemplate(dndItemId, cardTemplateId);

        setCardEditorTextAreaProps(
            cardEditorTextAreaProps => [
                ...cardEditorTextAreaProps,
                {
                    dndItemId: dndItemId,
                    placeholder: "Placeholder",
                    input: "TROLL LOL LOL LOLOLOLOLOLOLLL LOL I NEED A HERO", // We don't need this
                    // rows: 4,
                    // columns: 50,
                    borderColor: "white",
                    borderRadius: 4,
                    fontFamily: "Calibri",
                }
            ]);

        setDndItems(prevItems => {
            prevItems.forEach(item => {
                console.log(`Item: ${JSON.stringify(item)}`);
            });
            return prevItems;
        });
        // Insert CardEditorTextArea here
        // Return data, don't actually generate the JSX her
    };

    // Handle rendering children here
    // Store the positions of the children

    // Extend the drag start
    const handleExtendedDragStart= useCallback((event: DragStartEvent) => {
        const { active } = event;

        const activeItem = dndItems.find(item => item.id === active.id);

        console.log(`Active item on start drag: ${active.id}, position: ${activeItem?.position.x}, ${activeItem?.position.y}`);

    }, [dndItems, droppableContainers]);

    // Extend the drag end
    // https://www.youtube.com/watch?v=C-D6O9Xz1YU
    // Key word: getBoundingClientRect() for the card template, which should be the parent

    // Why isn't it working, it's always dragging over something?
    const handleExtendedDragEndNoOver = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        // Get the closest position on card to wherever you drag

        // Gotta grab the dimensions of that dragged item
        const nodeRect = active.rect.current.translated;
        const activeItem = dndItems.find(item => item.id === active.id);
        console.log(`Active item on start end: ${active.id}, position: ${activeItem?.position.x}, ${activeItem?.position.y}`);
        console.log('Dragged item dimensions:', nodeRect?.width, nodeRect?.height);

        // Grab the card dimensions beforehand, then clamp the positioning of the active item to be in the card
    }, [dndItems, droppableContainers]);

    const handleExtendedDragEndOnOver = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        const activeItem = dndItems.find(item => item.id === active.id);
        const overItem = dndItems.find(item => item.id === over?.id);

        if (!activeItem || !overItem) return;

        console.log(`Active item on end drag: ${active.id}, Over item on end drag: ${over?.id}`);
    }, [dndItems, droppableContainers]);

    // Set the style of the card dnd item here

    // If there's no id passed in, then make the word for the button be "Create" instead of "Save"
    // If there's an id then we need to populate the droppable container as well as the dndItems for this
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            alignItems: 'center',
            zIndex: 10,
        }}>
            {/* Have input and image here, click on them, add them to the dndItems and droppableContainers */}
            { /* Have the DndBoard be nested inside of the editor, click on an input or text and then it plops onto the card droppable container? The child between the DndBoard is gonna be the card*/}
            {/* Have it possible so that the card's actual dimensions is based on the editor, but you can change the aspect ratio and it changes the porportions*/}
            <div className='row'>
                <div className='column'>
                    <DndImplementationProvider
                        dndItems={dndItems}
                        setDndItems={setDndItems}

                        droppableContainers={droppableContainers}
                        setDroppableContainers={setDroppableContainers}

                        originalActiveZIndex={originalActiveZIndex}
                        setOriginalActiveZIndex={setOriginalActiveZIndex}

                        handleExtendedDragStart={handleExtendedDragStart}
                        handleExtendedDragEndNoOver={handleExtendedDragEndNoOver}
                        handleExtendedDragEndOnOver={handleExtendedDragEndOnOver}
                    >
                        <DndBoard>
                            {/* Map the data of the card editor text area, and inside that map, you generate CardEditorTextArea itself and then pass the values of that data*/}
                            {cardEditorTextAreaProps.map((props, index) => (
                                <CardEditorTextArea
                                    key={index}
                                    dndItemId={props.dndItemId}
                                    placeholder={props.placeholder}
                                    input={props.input}
                                    rows={props.rows}
                                    columns={props.columns}
                                    borderColor={props.borderColor}
                                    borderRadius={props.borderRadius}
                                    fontFamily={props.fontFamily}
                                />
                            ))}
                            {/*<Card
                                key={'Card Template'}
                                dndItemId={'Card Template'} // For seeing whether it should be instancing components for the faces
                                width={dndItems[0]?.style?.width} // Modify
                                height={dndItems[0]?.style?.height} // Modify, have it be based on aspect ratio, how does that work though if it's inside the editor as a child
                                isFlipped={false}
                                isInZone={true}
                            />*/}
                        </DndBoard>
                    </DndImplementationProvider>
                </div>
                <div className="column" onClick={createTextArea}>
                    <CardEditorTextArea
                        dndItemId={'Card Template'}
                        placeholder={"Placeholder"}
                        input={"Text"}
                        rows={4}
                        columns={50}
                        borderColor={"white"}
                        borderRadius={4}
                        fontFamily={"Calibri"}
                    />
                </div>
            </div>
            <div className='row'>
                <div className="column">
                    <button>
                        {cardId === '' || cardId === undefined ? 'Create' : 'Save'}
                    </button>
                </div >
                <div className="column">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default DndCardEditorMenuBoard;