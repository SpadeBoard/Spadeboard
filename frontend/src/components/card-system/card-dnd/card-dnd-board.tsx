import React, { useState, useCallback } from 'react';

import DndBoard from '../../../utils/dnd/dnd-board';
import { getContaineePairedWithContainer, onToggleDraggability, onToggleDroppability } from '../../../utils/dnd/dnd-utils';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

import { DndItemProps, DroppableContainerProps, DndBoardImplementation } from '../../../utils/dnd/dnd-interfaces';

import { ActionContextMenuItem } from '../../../utils/action-context-menu-item'; // Assuming this is where your item type is defined

import Card from '../card-functionality/card';

import DisplaceCardMenu from '../card-functionality/displace-card-menu';

// Hopefully this can be used to make sure setting the states in the children don't fuck up synchronisation
import { DndImplementationProvider} from '../../../utils/dnd/dnd-implementation-context';
import DndCardEditorMenuBoard from '../card-editor/card-editor-menu-dnd-board';

// Have subclasses of this, position needs to be passable
interface StyleParams {
    position?: { x: number; y: number };
}

// Does position have to be number | string everywhere?
export interface CardStyleParams {
    position?: { x: number; y: number };
    isOver?: boolean;
    isDragging?: boolean;
    isInDeck?: boolean;
    zIndex?: number;
    transform?: { x: number; y: number } | null;
    width?: string;
    height?: string;
    backgroundColor?: string;
}

interface DeckStyleParams {
    position: { x: number; y: number };
    zIndex: number;
    transform?: DOMMatrix | null;
    isHovered: boolean;
    deckDimensions: { width: number; height: number };
    deckPadding: number;
}


interface CardState {
    cardId: string | number;
    isFlipped: boolean;
    isInZone: boolean;
}

export const cardDraggableStyle = ({
    position = { x: 0, y: 0 },
    isOver = false,
    isDragging = false,
    isInDeck = false,
    zIndex = 0,
    // transform = null,
    width/*'fit-content'*/,
    height/*'fit-content'*/,
    backgroundColor = 'white'
}: CardStyleParams = {}): React.CSSProperties => {
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
        // transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    };
};

export const deckDroppableStyle = ({
    position,
    zIndex,
    // transform,
    isHovered,
    deckDimensions,
    deckPadding
}: DeckStyleParams): React.CSSProperties => {
    return {
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: 'fit-content',
        height: 'fit-content',
        minWidth: `${deckDimensions.width}px`,
        minHeight: `${deckDimensions.height}px`,
        zIndex: zIndex,
        // transform: transform ? transform.toString() : undefined,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        boxShadow: isHovered ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
        border: '2px solid',
        borderColor: isHovered ? '#2ecc71' : '#27ae60', // Lighter green when hovered
        borderRadius: '15px',
        backgroundColor: 'rgba(46, 204, 113, 0.1)', // Light green background
        padding: `${deckPadding}px`,
    };
};

// I think we need to use Context by this point, the prop drilling's probably fucking
// with the rendering somehow
const DndCardBoard: React.FC<DndBoardImplementation> = () => {
    // Use fit-content, and have minimum width and minimum height
    const deckPadding = 20; // Extra space around the cards
    const [deckDimensions, setDeckDimensions] = useState({ width: 200 + deckPadding * 2, height: 300 + deckPadding * 2 });

    const [isCardEditorOpen, setIsCardEditorOpen] = useState<boolean>(false);

    // Always have styles be transformable in terms of positioning
    // There's an extra position variable for the style, use the positioning of the actual item, pass in for the style
    // Sample context menu items

    // Refactor these, make sure they're reusable, put them in actions-context-menu-utils
    const cardContextMenuItems: ActionContextMenuItem[] = [
        {
            name: 'Edit',
            onClick: (id: string | number) => console.log(`Open the menu and have the card id be passed in: ${id}`),
        },
        {
            name: 'Delete',
            onClick: (id: string | number) => deleteItem(id),
        },
        {
            name: 'Flip',
            onClick: (id: string | number) => handleFlip(id), // Pass id to handleFlip
        },
    ];

    const deckContextMenuItems: ActionContextMenuItem[] = [
        {
            name: 'Displace card',
            onClick: (id: string | number) => handleDisplaceOpen(id),
        },
        {
            name: 'Shuffle',
            onClick: (id: string | number) => onShuffle(id),
        },
        {
            name: 'Lock',
            onClick: (id: string | number) => onToggleLock(id),
        },
    ];

    const [styles, setStyles] = useState<{ [key: string]: React.CSSProperties }>({
        'Card 1': cardDraggableStyle({
            zIndex: 0,
            position: { x: 150, y: 700 },
        }),
        'Deck 1': deckDroppableStyle({
            zIndex: 0,
            position: { x: 500, y: 500 },
            // transform: null,
            isHovered: false,
            deckDimensions: deckDimensions,
            deckPadding: deckPadding,
        }),
        'Card 2': cardDraggableStyle({
            zIndex: 0,
            position: { x: 900, y: 200 },
        }),
        'Card 3': cardDraggableStyle({
            zIndex: 0,
            position: { x: 0, y: 300 }
        }),
        'Deck 2': deckDroppableStyle({
            zIndex: 0,
            position: { x: 1000, y: 600 },
            // transform: null,
            isHovered: false,
            deckDimensions: deckDimensions,
            deckPadding: deckPadding,
        })
    });


    // Main data
    // Add context menu items here?
    // ${Math.random()}-${Date.now()}
    const [dndItems, setDndItems] = useState<DndItemProps[]>([
        {
            id: `Card 1`,
            type: 'card',
            isDraggable: true,
            isDroppable: true,
            zIndex: 0,
            position: { x: 150, y: 700 },
            // https://www.google.com/search?q=getters+and+setters+in+react&sca_esv=489e4a82e1f971c0&sca_upv=1&source=hp&ei=lrD1Zv-MFKnw0PEP_7r7kAo&iflsig=AL9hbdgAAAAAZvW-pnWyggj0SUSgmVZN8n0sfQo3ZVi8&ved=0ahUKEwj_r4fupuGIAxUpODQIHX_dHqIQ4dUDCBA&uact=5&oq=getters+and+setters+in+react&gs_lp=Egdnd3Mtd2l6IhxnZXR0ZXJzIGFuZCBzZXR0ZXJzIGluIHJlYWN0MgYQABgWGB4yBhAAGBYYHjILEAAYgAQYhgMYigUyCxAAGIAEGIYDGIoFMgsQABiABBiGAxiKBTIIEAAYgAQYogQyCBAAGIAEGKIESI4YUABYxhdwAHgAkAEAmAHvAqABkxWqAQgxOC44LjAuMbgBA8gBAPgBAZgCG6ACwBfCAgsQABiABBixAxiDAcICERAuGIAEGLEDGNEDGIMBGMcBwgIOEAAYgAQYsQMYgwEYigXCAg4QLhiABBixAxiDARjUAsICCxAuGIAEGLEDGIMBwgIOEC4YgAQYsQMYgwEYigXCAgsQLhiABBjRAxjHAcICBRAuGIAEwgIIEC4YgAQYsQPCAgUQABiABMICBBAAGAPCAhQQLhiABBixAxjRAxiDARjHARiKBcICCBAAGIAEGLEDwgIKEC4YgAQY1AIYCsICDhAuGIAEGLEDGMcBGK8BwgINEC4YgAQYsQMY1AIYCsICCBAAGBYYHhgPmAMAkgcJMTUuMTAuMS4xoAer0gE&sclient=gws-wiz
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only
            // https://www.perplexity.ai/search/const-dnditems-setdnditems-use-k9DGfrb.TvC4hIIjn5hrxA
            get style() {
                return cardDraggableStyle({
                    position: this.position,
                    zIndex: this.zIndex,
                    width: `${deckDimensions.width - deckPadding}px`,
                    height: `${deckDimensions.height - deckPadding}px`
                });
            },
            contextMenuItems: cardContextMenuItems
        },
        {
            id: `Deck 1`,
            type: 'deck',
            isDraggable: true,
            isDroppable: true,
            zIndex: 0,
            position: { x: 500, y: 500 },
            get style() {
                return deckDroppableStyle({
                    position: this.position,
                    zIndex: this.zIndex,
                    // transform: null,
                    isHovered: false,
                    deckDimensions: deckDimensions,
                    deckPadding: deckPadding,
                });
            },
            contextMenuItems: deckContextMenuItems
        },
        {
            id: `Card 2`,
            type: 'card',
            isDraggable: true,
            isDroppable: true,
            zIndex: 0,
            position: { x: 900, y: 200 },
            get style() {
                return cardDraggableStyle({
                    position: this.position,
                    zIndex: this.zIndex,
                    width: `${deckDimensions.width  - deckPadding}px`,
                    height: `${deckDimensions.height  - deckPadding}px`
                });
            },
            contextMenuItems: cardContextMenuItems
        },
        {
            id: `Card 3`,
            type: 'card',
            isDraggable: true,
            isDroppable: true,
            zIndex: 0,
            position: { x: 0, y: 300 },
            get style() {
                return cardDraggableStyle({
                    position: this.position,
                    zIndex: this.zIndex,
                    width: `${deckDimensions.width - deckPadding}px`,
                    height: `${deckDimensions.height  - deckPadding}px`
                });
            },
            contextMenuItems: cardContextMenuItems,
        },
        {
            id: `Deck 2`,
            type: 'deck',
            isDraggable: true,
            isDroppable: true,
            zIndex: 0,
            position: { x: 1000, y: 600 },
            get style() {
                return deckDroppableStyle({
                    position: this.position,
                    zIndex: this.zIndex,
                    // transform: null,
                    isHovered: false,
                    deckDimensions: deckDimensions,
                    deckPadding: deckPadding,
                });
            },
            contextMenuItems: deckContextMenuItems
        },
    ]);

    // Use index signatures instead? Container Id be the key?
    const [droppableContainers, setDroppableContainers] = useState<DroppableContainerProps[]>([
    ]);


    const [originalActiveZIndex, setOriginalActiveZIndex] = useState<number>(-1);


    /* Card data, which is separate from the dnd stuff and is layered on top*/
    /*Fields, cardId: string | number, isFlipped: boolean*/
    const [cardsState, setCardsState] = useState<CardState[]>([
    ])

    const createCard = (item: DndItemProps): JSX.Element => {
        // Return a card with the style from the original item
        // Eventually when making cards, pass in CSS and TSX material

        const cardStyle = item?.style;

        // Extract width and height if they exist
        const width = cardStyle?.width;
        const height = cardStyle?.height;

        // Check if the card already exists in cardsState
        createCardState(item.id);

        /*console.log(JSON.stringify(cardsState.map(cardState => ({
            cardId: cardState.cardId,
            isFlipped: cardState.isFlipped,
            isInZone: cardState.isInZone
        })), null, 2));*/

        const cardState = cardsState.find(cardState => cardState.cardId === item.id);

        return (
            <Card
                key={item.id}
                dndItemId={item.id}
                width={width}
                height={height}
                isFlipped={cardState?.isFlipped || false}
                isInZone={cardState?.isInZone || false}
            />
        );
    };

    const createCardState = (itemId: string | number): void => {
        const existingCard = cardsState.find(cardState => cardState.cardId === itemId);

        if (existingCard)
            return;

        // If the card doesn't exist, add it to cardsState, this check is necessary because gonna update the card state later and don't want to accidentally add new elements on rerender
        setCardsState(prevState => [
            ...prevState,
            {
                cardId: itemId,
                isFlipped: false,
                isInZone: false,
            }
        ]);
    }

    const alignCardInDeck = (id: string | number): void => {
        /*setDndItems((prevItems: DndItemProps[]) => {
            let item: DndItemProps | undefined = prevItems.find((item) => (item.id === id));
    
            // TypeError: Cannot set property style of #<Object> which has only a getter
            if (item) {
                item.position = { x: 0, y: 0 }; // Set position to top-left corner (0%, 0%)
                item.style = {
                    ...(item.style || {}),
                    position: 'absolute',
                    top: '0%',
                    left: '0%',
                };
            }
    
            return prevItems;
        });*/

        // Setting the card container
        setDndItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        position: { x: 0, y: 0 }, // Set position to top-left corner (0%, 0%)
                        /*style: {
                            ...(item.style || {}),
                            position: 'absolute',
                            top: '0%',
                            left: '0%',
                        },*/
                    };
                }
                return item; // Return unchanged item
            })
        );

        // Setting the card
        // Update the cards state so that you can rerender the cards inside the DndItemProps draggable container
        setCardsState(prevCardsState =>
            prevCardsState.map(cardState => {
                if (cardState.cardId === id || cardState.cardId === id) {
                    return { ...cardState, isInZone: true };
                }
                return cardState; // Return unchanged card
            })
        );
    }




    const handleFlip = useCallback((id: string | number): void => {
        // Log the id for demonstration purposes, problem is this is the context menu's id, not the card's id
        const DndItemProps: DndItemProps | undefined = dndItems.find(item => item.id === id);

        if (DndItemProps)
            console.log(`Flipping item with id: ${id} and of type ${DndItemProps.type}`);

        setCardsState(prevCardsState => prevCardsState.map(cardState =>
            cardState.cardId === id ? { ...cardState, isFlipped: !cardState.isFlipped } : cardState
        ));
    }, []);

    // If the DndItemProps is in a droppable container,
    // add the already existing context menu items to the droppable container's context menu


    const deleteItem = (id: string | number): void => {
        console.log(`Delete clicked for id: ${id}`);

        // This works for everything, so if we want to just delete card
        // Filter that the id has to be type card then do this

        setDndItems(prevItems => prevItems.filter(item => item.id !== id));
        setDroppableContainers(prevItems => prevItems.filter(container => container.containeeId !== id || container.containerId !== id));

        /*console.log(
            `Dnd items:\n${dndItems.map(item => JSON.stringify(item, null, 2)).join('\n')}\n\nDroppable containees:\n${droppableContainers.map(container => JSON.stringify(container, null, 2)).join('\n')}`
        );*/
    }

    // Should be in a utils file somewhere
    function clamp(num: number, min: number, max: number): number {
        return num <= min ? min
            : num >= max
                ? max : num
    }



    const [isDisplaceCardMenuOpen, setIsDisplaceCardMenuOpen] = useState(false);
    const [currentDeckId, setCurrentDeckId] = useState<string | number>(0);

    // This is for handling the data
    const handleDisplaceClose = () => {
        setIsDisplaceCardMenuOpen(false);
    };

    const handleDisplace = (srcDeckId: string | number, amount: number, destinationDeckId: string): void => {

        // Grab the containees from srcDeckId, place in a new array
        // split the array based on the amount of cards into a new array
        // Take that, change the container id of them to the destination deck id

        let cardsContaineeIds: (string | number)[] = getContaineePairedWithContainer(droppableContainers, srcDeckId);
        let cardsIdToAddToDestinationDeck: (string | number)[]  = [];

        let lastCardIndex: number = cardsContaineeIds.length;

        if (lastCardIndex === -1) {
            handleDisplaceClose();
            return;
        }

        cardsIdToAddToDestinationDeck = cardsContaineeIds.splice(clamp(lastCardIndex - amount, 0, lastCardIndex), lastCardIndex);

        setDroppableContainers(previousContainers => 
            previousContainers.map(item => {
                if (cardsIdToAddToDestinationDeck.includes(item.containeeId)) {
                    return {...item, containerId: destinationDeckId};
                }
                return item;
            })
        );

        if (cardsIdToAddToDestinationDeck)
            cardsIdToAddToDestinationDeck.forEach(cardId => alignCardInDeck(cardId));

        handleDisplaceClose();
    };

    const handleDisplaceOpen = (id: string | number): void => {
        console.log(`Current deck id: ${id}`);

        setCurrentDeckId(id);
        setIsDisplaceCardMenuOpen(true);

        console.log('Displace card clicked clicked, pass in deck id and set the menu to open');
    }


    function fisherYates(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    };

    const onShuffle = (id: string | number): void => {
        const Deck: DndItemProps | undefined = dndItems.find(item => item.id === id);

        if (Deck)
            console.log(`Shuffle item with id: ${id} and of type ${Deck.type}`);

        // Gotta do this to get the most up to date state for droppable containers
        let currentDroppableContainers: DroppableContainerProps[]  = [];
        setDroppableContainers(prevContainers => (currentDroppableContainers = prevContainers, prevContainers));

        if (currentDroppableContainers.length < 1)
            return;

        let containeeIds = getContaineePairedWithContainer(currentDroppableContainers, id);

        let containeeZIndexes: number[] = [];

        let cardsInDecksWithZIndex = new Map<string | number, { zIndex: number }>();

        containeeIds.forEach((containeeId) => {
            let containee = dndItems.find(item => item.id === containeeId);

            if (containee) {
                containeeZIndexes.push(containee.zIndex);
            }
        });

        const shuffledContaineeIds = fisherYates([...containeeIds]);

        for (let i = 0; i < shuffledContaineeIds.length; i++) {
            cardsInDecksWithZIndex.set(shuffledContaineeIds[i], {
                zIndex: containeeZIndexes[i]
            });
        }

        // This is for appearance, which card is stacked on top of which
        setDndItems(prevItems => prevItems.map(item => {
            if (cardsInDecksWithZIndex.has(item.id)) {
                return {
                    ...item,
                    zIndex: cardsInDecksWithZIndex.get(item.id)!.zIndex
                };
            }
            return item; // Return unchanged item
        }));

        // This is necessary for displacing cards because the cards being displaced are based on their positioning inside of the array
        setDroppableContainers(prevItems => prevItems.filter(container => container.containerId !== id));

        // Ok, this isn't working
        // Spread the old items
        // Grab each containee Id, make a new entry
        setDroppableContainers(prevContainers => {
            const newContainers = [...prevContainers];

            cardsInDecksWithZIndex.forEach((value, key) => {
                newContainers.push({
                    containerId: id,
                    containeeId: key,
                    position: (() => {
                        const item = dndItems.find(item => item.id === key);
                        return item ? item.position : {x: 0, y: 0};
                    })(),
                    zIndex: value.zIndex
                });
            });

            return newContainers;
        });

        setDroppableContainers(newDroppableContainers => {
            console.log("SHUFFLE");
            newDroppableContainers.forEach((container) => {
                console.log(`Container: ${container.containerId}, Containee: ${container.containeeId}`);
                console.log(JSON.stringify(container, null, 2));
            });
            return newDroppableContainers;
        });



        // Dictionary: key is the dndItem, and then the Z-index is the value
        // You'd then shuffle the entire object around, and then have the Z-index update to be the index of the element inside the dicitionary
        // Then loop through the dndItems, and then pass the value of the Z-index that way
        /*console.log(
            `SHUFFLED\n\nDnd items:\n${dndItems.map(item => JSON.stringify(item, null, 2)).join('\n')}\n\nDroppable containees:\n${droppableContainers.map(container => JSON.stringify(container, null, 2)).join('\n')}`
        );*/
    }

    // Why is setting something to not be draggable causing issues?
    // This needs to be in DndUtils
    // Problem is how can these work considering that I'm using states
    const onToggleLock = (id: string | number): void => {
        onToggleDraggability(setDndItems, id);
    }


    // HAVE HANDLE START DRAG AND HANDLE END DRAG HERE TO CUSTOMISE IT?
    // When two cards overlap, they should create a deck, add a deck to dndItems
    // Then add those cards into droppableContainers
    const createDeck = (position?: { x: number | 0, y: number | 0 }): DndItemProps => {
        const newDeck: DndItemProps = {
            id: `${Math.random()}-${Date.now()}`,
            type: 'deck',
            isDraggable: true,
            isDroppable: true,
            zIndex: 0,
            position: (position) ? position : { x: Math.floor(Math.random() * (1920 - 0) + 0), y: Math.floor(Math.random() * (1080 - 0) + 0) },
            get style() {
                return deckDroppableStyle({
                    position: this.position,
                    zIndex: this.zIndex,
                    isHovered: false,
                    deckDimensions,
                    deckPadding,
                });
            },
            contextMenuItems: deckContextMenuItems
        };

        // Update state with the new deck added to existing items
        setDndItems((prevDndItems) => [...prevDndItems, newDeck]);

        return newDeck;
    }

    const getAllCardsIdsFromDecks = (
        activeId: string | number,
        overId: string | number,
        allContaineeIds: (string | number)[],
        allContainerIds: (string | number)[],
        droppableContainers: DroppableContainerProps[]
    ): void => {
        const updatedContainees: (string | number)[] = [...allContaineeIds];

        allContainerIds.forEach(containerId => {
            // Get the containees associated with the current containerId
            const containees = getContaineePairedWithContainer(droppableContainers, containerId);

            // Active and over cards should already be added to allContaineeIds beforehand
            containees.forEach(draggable => {
                if (!updatedContainees.includes(draggable) && (draggable !== activeId) && (draggable !== overId)) {
                    updatedContainees.push(draggable);
                }
            });
        });

        // Update state with the new array of containees
        // We got all the cards
        allContaineeIds.push(...updatedContainees);
    }

    const mergeCardsFromPreviousDecksToNewDeck = (newDeckId: string | number, allCardsId: (string | number)[] | undefined): void => {
        if (allCardsId === undefined)
            return;

        console.log(`Merge cards together`);

        allCardsId.forEach(cardId => {
            const draggableItem = dndItems.find(item => item.id === cardId);

            // Get position and zIndex from the found item or set default values
            // Because either way we're gonna modify the styling and the actual card positions
            // Like the position and zIndex here, I haven't figured out how to use yet
            // But the zIndex needs to be here for shuffling purposes
            const draggablePosition = draggableItem ? draggableItem.position : undefined;
            const draggableZIndex = draggableItem ? draggableItem.zIndex : undefined;

            if (newDeckId && cardId && draggablePosition && draggableZIndex) {
                setDroppableContainers(prevContainers => [
                    ...prevContainers,
                    {
                        containerId: newDeckId,
                        containeeId: cardId,
                        position: draggablePosition,
                        zIndex: draggableZIndex,
                    },
                ]);
            }
        });
    }

    const generateCombinedDeck = (activeId: string | number, overId: string | number, overPosition: { x: number, y: number }, allContaineeIds: (string | number)[] | undefined, containerIdsToRemove: (string | number)[] | undefined, droppableContainers: DroppableContainerProps[]): void => {
        if (allContaineeIds === undefined)
            return;

        // This is so that cards with no decks can still create a new deck without having this ran
        if (containerIdsToRemove) {
            // console.log(`Generate combined deck: remove old decks`);

            // console.log("All container IDs:", containerIdsToRemove.join(", "));

            getAllCardsIdsFromDecks(activeId, overId, allContaineeIds, containerIdsToRemove, droppableContainers);

            // This part only removes all the droppables which are the decks so that we can make a new deck for all the cards
            containerIdsToRemove.forEach(containerId => deleteItem(containerId));
        }

        // console.log("All containee IDs:", allContaineeIds.join(", "));

        // Really should be its own function that we call
        // Add all cards to new deck
        let newDeck = createDeck(overPosition);
        const newDeckId: string | number = newDeck.id;

        mergeCardsFromPreviousDecksToNewDeck(newDeckId, allContaineeIds);

        // Set the draggability of the cards to none so we can only drag the deck?
        // Toggle card draggability and deck draggability
        // You could do this where we grab the deck id, and if there's draggable items
        // inside the droppable containees associated with it, we disable or enable the DndItemProps with highest zIndex


        // Update the styling so that they actually align in the decks
        if (allContaineeIds)
            allContaineeIds.forEach(cardId => alignCardInDeck(cardId));
    }


    // SET DATA HERE, RENDER IS ELSEWHERE 
    // God do I need to reorganise this code
    

    // I think dndItems need to use useContext in this case
    const handleExtendedDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;

        // Maybe turn off draggability of non active dndItems temporarily?
        // Question is how would that affect multiuser dragging
        // Why is this being weird and causing cards to appear?

        // Ok, so this is causing more issues than I thought
        // For some reason the length of this is 1, for some reason?
        /*setDndItems((prevItems: DndItemProps[]) => 
            prevItems.map(item => ({
                ...item,
                isDraggable: item.id === active.id // Only make the active item draggable
            }))
        );*/

        const activeItem = dndItems.find(item => item.id === active.id);

        /*if (activeItem)
            console.log(`Active item type: ${activeItem.type}`);*/

        // Handle context sensitivity in here for dragging deck vs. card on top?
        // Grab the millimeters where it's held down and held at the original position
        // Then set z index of the card to be lower than deck to drag deck?
    }, [dndItems, droppableContainers]);

    // Avoid the last two parameters if possible
    // The reason why I have them is because state updates are asynchronous
    const handleExtendedDragEndOnOver = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (active === null || over === null) return;

        // Set all items of type card to be draggable
        // At least for now
        /*setDndItems((prevItems: DndItemProps[]) =>
            prevItems.map(item => ({
                ...item,
                isDraggable: true // item.type === 'card'
            }))
        );*/

        // If active and over are type card
        // Again this should be fine because in the original function it handles the overlap itself
        // between any droppable and any draggable
        const activeItem = dndItems.find(item => item.id === active.id);

        // Set the active item to be not droppable as it'll be added to a deck
        // It's to make sure that cards can only overlap on decks
        // We always want decks to be draggable
        if (activeItem && activeItem.type === 'card') {
            onToggleDroppability(setDndItems, active.id);

            // How is it true?
            // console.log(`Active item droppability: ${activeItem.isDroppable}`);
        }

        // Wait a minute, this is just if the active item type doesn't match the over item type
        // Goddamnit

        // Because it doesn't take into account whether a deck is being dragged over a card
        const overItem = dndItems.find(item => item.id === over.id);
        if (!activeItem || !overItem) return;

        // If they're both decks then the logic would be nearly identical
        // Just grab the getContaineePairedWithContainer instead
        // And the logic's pretty much done
        let allContaineeIds: (string | number)[] = [];
        let containerIdsToRemove: (string | number)[] = [];

        switch (overItem.type) {
            case 'deck':
                if (activeItem.type === 'deck') {
                    // No cards, then you just get rid of a deck
                    if (!droppableContainers.find(item => item.containerId === active.id) ||
                        !droppableContainers.find(item => item.containerId === over.id)) {
                        setDndItems(prevItems => prevItems.filter(item => item.id !== active.id));
                        return;
                    }

                    // Whether the deck already has cards
                    const activeContaineeIds: (string | number)[] = getContaineePairedWithContainer(droppableContainers, active.id);
                    const overContaineeIds: (string | number)[] = getContaineePairedWithContainer(droppableContainers, over.id);

                    allContaineeIds.push(...activeContaineeIds, ...overContaineeIds);
                    containerIdsToRemove.push(active.id, over.id);

                    generateCombinedDeck(active.id, over.id, overItem.position, allContaineeIds, containerIdsToRemove, droppableContainers);

                    setDroppableContainers(newDroppableContainers => {
                        console.log("DECK ON DECK");
                        newDroppableContainers.forEach((container) => {
                            console.log(`Container: ${container.containerId}, Containee: ${container.containeeId}`);
                            console.log(JSON.stringify(container, null, 2));
                        });
                        return newDroppableContainers;
                    });
                    return;
                }

                // Make sure that defaultly speaking, cards in decks cannot be dragged
                // If a card can be dragged, have a toggle, and have it only be the top card that's draggable
                // And when it is dragged, check for the event delta position and if it's not zero, take it out of the deck
                onToggleDraggability(setDndItems, active.id);

                setDroppableContainers(newDroppableContainers => {
                    console.log("CARD ON DECK");
                    newDroppableContainers.forEach((container) => {
                        console.log(`Container: ${container.containerId}, Containee: ${container.containeeId}`);
                        console.log(JSON.stringify(container, null, 2));
                    });
                    return newDroppableContainers;
                });
            
                // So active is card checking for deck with cards
                /*if (droppableContainers.find(item => item.containerId === over.id)) {
                    const overContaineeIds: (string | number)[] = getContaineePairedWithContainer(droppableContainers, over.id);

                    setDroppableContainers(prevItems => [...prevItems, 
                        containerId: over.id,
                        containeeId: 
                    ]);

                    allContaineeIds.push(...overContaineeIds, active.id);
                    containerIdsToRemove.push(over.id);

                    generateCombinedDeck(active.id, over.id, overItem.position, allContaineeIds, containerIdsToRemove, droppableContainers);
                }*/
                break;
            case 'card':
                // Cards added to decks shouldn't be droppable, therefore these should be standalone cards
                // State asynchronisation?

                // This is just in case if the droppable containers is modified before this and added the on over card as a container
                // for the active card overlapping it

                // Wait, why are there always two decks on top of each other?
                containerIdsToRemove.push(over.id);
                setDroppableContainers(prevItems => prevItems.filter(container => container.containerId !== over.id));

                allContaineeIds.push(active.id, over.id);

                let newDeck = createDeck(overItem.position);
                const newDeckId: string | number = newDeck.id;

                setDroppableContainers(prevContainers => [
                    ...prevContainers,
                    {
                        containerId: newDeckId,
                        containeeId: active.id,
                        position: activeItem.position,
                        zIndex: activeItem.zIndex,
                    },
                    {
                        containerId: newDeckId,
                        containeeId: over.id,
                        position: overItem.position,
                        zIndex: overItem.zIndex,
                    },
                ]);

                if (allContaineeIds)
                    allContaineeIds.forEach(cardId => alignCardInDeck(cardId));

                setDroppableContainers(newDroppableContainers => {
                    console.log("CARD ON CARD");
                    newDroppableContainers.forEach((container) => {
                        console.log(`Container: ${container.containerId}, Containee: ${container.containeeId}`);
                        console.log(JSON.stringify(container, null, 2));
                    });
                    return newDroppableContainers;
                });

                // Ok might as well run 
                // How are all draggable ids undefined
                // Ok, screw this, no using states
                // generateCombinedDeck(active.id, over.id, overItem.position, allContaineeIds, containerIdsToRemove, droppableContainers);
                return;
                break;
            default:
            // code block
        }

        /*console.log(
            `Active id: ${active.id}
            Over id: ${over?.id}
            Droppable containees:`
        );

        console.log(`Dnd items: ${dndItems.map(item => JSON.stringify(item, null, 2)).join('\n')}`);

        droppableContainers.forEach((container) => {
            console.log(`Droppable ${container.containerId} with draggable ${container.containeeId}:
                ${JSON.stringify(container, null, 2)}`);
        });*/


        /*if (activeItem.type === overItem.type) {
            // Check to see if over type is card
            // Check to see if over type is deck

            // IF ACTIVE AND OVER ITEMS ARE DECKS
            if (overItem.type === 'deck') {
                console.log('Decks over decks');

                if (droppableContainers.find(item => item.containerId === active.id) ||
                    droppableContainers.find(item => item.containerId === over.id)) {

                    const activeContaineeIds: (string | number)[] = getContaineePairedWithContainer(droppableContainers, active.id);
                    const overContaineeIds: (string | number)[] = getContaineePairedWithContainer(droppableContainers, over.id);

                    allContaineeIds.push(...activeContaineeIds, ...overContaineeIds);
                    containerIdsToRemove.push(active.id, over.id);

                    generateCombinedDeck(active.id, over.id, overItem.position, allContaineeIds, containerIdsToRemove, droppableContainers);
                    return;
                }

                setDndItems(prevItems => prevItems.filter(item => item.id !== active.id));
                return;
            }

            // IF ACTIVE AND OVER ITEMS ARE CARDS
            // The behavior's strange, card on top of another card, dnd item can't render
            if (overItem.type === 'card') {
                if (droppableContainers.find(item => item.containeeId === active.id) ||
                    droppableContainers.find(item => item.containeeId === over.id)) {

                    console.log(`Overlapping cards in decks`);

                    // Theoretically you'd only ever have 1 to many relationship where 1 deck has multiple cards
                    // The goal is to make sure a deck is never a draggable id paired with another deck with a droppable id
                    // Containers shouldn't be in containees
                    const activeContainerIds: (string | number)[] = getContainerPairedWithContainee(droppableContainers, active.id);
                    const overContainerIds: (string | number)[] = getContainerPairedWithContainee(droppableContainers, over.id);

                    // Again, this should be fine, the arrays could just be empty
                    containerIdsToRemove.push(...activeContainerIds, ...overContainerIds);

                    generateCombinedDeck(active.id, over.id, overItem.position, allContaineeIds, containerIdsToRemove, droppableContainers);
                    
                    if (activeItem)
                        console.log(`Handle drag end  - active item type: ${activeItem.type}`);
            
                    console.log(
                        `Active id: ${active.id}
                        Over id: ${over?.id}
                        Droppable containees:`
                    );
            
                    console.log(`Dnd items: ${dndItems.map(item => JSON.stringify(item, null, 2)).join('\n')}`);
            
                    droppableContainers.forEach((container) => {
                        console.log(`Droppable ${container.containerId} with draggable ${container.containeeId}:
                            ${JSON.stringify(container, null, 2)}`);
                    });

                    return;
                }

                // State asynchronization issue?
                // Why is it that containerId doesn't have over.id
                if (droppableContainers.find(item => item.containerId === active.id) ||
                    droppableContainers.find(item => item.containerId === over.id)) {
                    // Ok, why is this so funky
                    console.log('Overlapping cards with neither in deck');

                    // CARD OVERLAPS ANOTHER CARD, NEITHER OF THEM ARE IN DECK
                    // I don't think you need to check whether over card is already in droppable container
                    // as a droppable despite pairing them in the original function? But just in case

                    // State asynchronisation?
                    setDroppableContainers(prevItems => prevItems.filter(container => container.containerId !== over.id));

                    allContaineeIds.push(active.id, over.id);

                    // Ok might as well run 
                    // How are all draggable ids undefined
                    // Ok, screw this, no using states
                    generateCombinedDeck(active.id, over.id, overItem.position, allContaineeIds, undefined, droppableContainers);
                    
                    if (activeItem)
                        console.log(`Handle drag end extended - active item type: ${activeItem.type}`);
            
                    console.log(
                        `Active id: ${active.id}
                        Over id: ${over?.id}
                        Droppable containees:`
                    );
            
                    console.log(`Dnd items: ${dndItems.map(item => JSON.stringify(item, null, 2)).join('\n')}`);
            
                    droppableContainers.forEach((container) => {
                        console.log(`Droppable ${container.containerId} with draggable ${container.containeeId}:
                            ${JSON.stringify(container, null, 2)}`);
                    });
                    
                    return;
                }
            }
        }

        // This is for if a deck is dragged over a card
        if (activeItem.type === 'deck' && overItem.type === 'card') {
            // Find out whether deck already is a droppable container
            // If so then get the card's id, pair droppable with draggable
            // If the card's already in a deck then merge decks together like above
            // Jesus

            // Swap containerId with containeeId and vice versa
            // If there's a container that matches active.id then swap
            // By this point, there should be a droppable container where the card is the droppable container
            setDroppableContainers(prev => prev.map(container => {
                if (container.containerId === active.id) {
                    return {
                        ...container,
                        containerId: container.containeeId,
                        containeeId: container.containerId
                    };
                }
                return container;
            }));

            return;

            // Do we want to create a new deck or just transfer decks over?
            // Feels like transferring over to an existing deck's just a lot easier and then delete one of the decks
            const decksIds: (string | number)[] = getContainerPairedWithContainee(droppableContainers, over.id);
            containerIdsToRemove.push(active.id, ...decksIds);

            return;
        }*/

        // Makes sure that the card overlapped in deck is right on top of it
        alignCardInDeck(active.id);
    }, [dndItems, droppableContainers]);


    // RENDER
    const handleDndItemChildrenRender = (id: string | number, isDraggable?: boolean, isDroppable?: boolean, type?: string, children?: React.ReactNode): React.ReactNode => {
        // if child is of type card and is in droppableContainers, don't render children?
        // Gotta render the card though

        // console.log('NEW CHILD RENDER');
        const item: DndItemProps | undefined = dndItems.find(item => item.id === id);

        if (item === undefined)
            return <></>;


        // console.log('Rendering item:', item);

        /*if (children)
            console.log('Children: ', children);*/

        // Why is it that cards are suddenly becoming decks?
        // How are decks not having any children, that makes no sense?

        // I think this is screwing up something, because this is the children that's being passed into DraggableAndDroppable
        return (
            <>
                {/* Temporary fix, here's the problem, we need to figure out how to fix the styling*/}
                {children}

                {/* In terms of rendering cards by themselves, just render the children as they are, which should be the card component*/}
                {/*{
                    item.type === 'card' &&
                    !droppableContainers.some(container =>
                        container.containeeId === id
                    ) &&
                    (
                        <>
                            {children}
                        </>
                    )
                }*/}
                {/* So this is for the deck specifically and rendering the children that way,
                Set the rendering style states here, they were called in the handlingDragEnd which is for data
                Maybe it should actually be for card, if there is an id associated with it in the droppable containees, then run setAlignToDeck and render it properly*/}
                {/*{
                    item.type === 'deck' &&
                    droppableContainers.some(container =>
                        container.containerId === id
                    )
                    && (
                        <div style={{ position: 'absolute', top: `0%`, left: `0%`, width: '100%', height: '100%', zIndex: `0` }}>
                            {children}
                        </div>
                    )
                }*/}
            </>
        );
    }

    const handleOnCloseCardEditorMenu = ():void => {
        setIsCardEditorOpen(prevState =>!prevState);
    }

    return (
        <DndImplementationProvider
            dndItems = {dndItems}
            setDndItems={setDndItems}

            droppableContainers={droppableContainers}
            setDroppableContainers={setDroppableContainers}

            originalActiveZIndex={originalActiveZIndex}
            setOriginalActiveZIndex={setOriginalActiveZIndex}

            handleExtendedDragStart={handleExtendedDragStart}
            handleExtendedDragEndOnOver={handleExtendedDragEndOnOver}

            handleDndItemChildrenRender={handleDndItemChildrenRender}
        >
            {/* Create card menu should also be here too, so here's the thing, inside of CardEditorMenu, or CardEditor,
            have a check to see if there's an id for the card to be passed into,
            If no id, then blank card
            Else render the card as it is right now*/}
            <button onClick={() => setIsCardEditorOpen(prevState =>!prevState)}>
                Toggle Card Editor
            </button>
            <DndBoard>
                {/*Don't think this is adding to cards state*/}
                {dndItems.filter(item => item.type === 'card').map(createCard)}
            </DndBoard>
            {/*With deck and deck ids, just use the dndItems*/}
            {isCardEditorOpen && (
                <DndCardEditorMenuBoard
                    onClose={handleOnCloseCardEditorMenu}
                />
            )}
            {isDisplaceCardMenuOpen && (
                <DisplaceCardMenu
                    isOpen={isDisplaceCardMenuOpen}
                    onClose={handleDisplaceClose}
                    onDisplace={handleDisplace}
                    availableDecksIds={dndItems
                        .filter(item => item.id !== currentDeckId && item.type === 'deck')
                        .map(item => item.id)
                    }
                    currentDeckId={currentDeckId || ''}
                />
            )}
        </DndImplementationProvider>
    );
};

export default DndCardBoard;