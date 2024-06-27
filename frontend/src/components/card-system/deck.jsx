import React, { useState } from "react";

import ComponentContainer from '../../utils/component-container';
import Shuffle from "shuffle";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

// Pass in the component to add to the deck
const Deck = ({ cards }) => {
  const [deck, setDeck] = useState(cards);

  const shuffleDeck = () => {
    if (deck.length < 1) {
      return;
    }
    
    // Assuming Shuffle is properly imported and used.
    setDeck(Shuffle.shuffle({ deck: deck }));
  }

  const radios = [
    { name: 'Shuffle', value: '1', onClick: shuffleDeck}
  ];

  return (
    <ComponentContainer 
        >
      <div>
        {deck.map((card, index) => (
          <div key={index} style={{ position: 'absolute', zIndex: index }}>
            {card}
          </div>
        ))}
        <ButtonGroup className="mb-2">
                            {radios.map((radio, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`radio-${idx}`}
                                type="radio"
                                variant="secondary"
                                name="radio"
                                value={radio.value}
                                onClick ={radio.onClick}
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