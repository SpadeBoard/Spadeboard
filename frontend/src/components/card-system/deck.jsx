import React, { useState, useEffect } from "react";
import ComponentContainer from '../../utils/component-container';

import Shuffle from 'shuffle';

import { OutPortal } from 'react-reverse-portal';

import ActionsContextMenu from '../../utils/actions-context-menu';

const Deck = ({ cards, portalNode }) => {
  const [deck, setDeck] = useState([]);

  // Update the state whenever the `cards` prop changes
  const updateDeck = useEffect(() => {
    setDeck(cards);
  }, [cards]);

  const shuffleDeck = () => {
    if (deck.length < 1) return;

    // Use Shuffle library to shuffle the deck
    const shuffledDeck = Shuffle.shuffle(deck);
    setDeck(shuffledDeck);
  };

  const actionsContextMenuItems = [
    { name: 'SHUFFLE', onClick: shuffleDeck },
    { name: 'DISPLACE CARD', onClick: shuffleDeck}
  ];

  const DeckOutPortal = (props) => {
    return <div id="deck">
      <OutPortal node={props.portalNode} />
    </div>
  }

  return (
    <ComponentContainer>
      <DeckOutPortal portalNode={portalNode} />
      <ActionsContextMenu contextMenuItemsId ={"deck"} contextMenuItems = {actionsContextMenuItems}/>
    </ComponentContainer>
  );
};

export default Deck;