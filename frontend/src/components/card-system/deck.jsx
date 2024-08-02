import React, { useState, useEffect } from "react";
import ComponentContainer from '../../utils/component-container';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Shuffle from 'shuffle';

import { OutPortal } from 'react-reverse-portal';

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

  const radios = [
    { name: 'Shuffle', value: '1', onClick: shuffleDeck }
  ];

  // Why is this giving issues?
  // What should be happening is that props.node should be deckPortalNode
  const DeckOutPortal = (props) => {
    return <div id = "deck">
      {deck.length > 0 && <OutPortal node={props.node}/>}
    </div>
  }

  return (
    <ComponentContainer>
      <DeckOutPortal node = {portalNode}/>
      <div>
        <ButtonGroup className="mb-2">
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                variant="secondary"
                name="radio"
                value={radio.value}
                onClick={radio.onClick}
              >
                {radio.name}
              </ToggleButton>
            ))}
        </ButtonGroup>
      </div>
    </ComponentContainer>
  );
};

export default Deck;