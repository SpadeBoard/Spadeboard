import React, { useState, useEffect } from "react";
import ComponentContainer from '../../utils/component-container';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Shuffle from 'shuffle';

const Deck = ({ cards }) => {
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

  return (
    <ComponentContainer>
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