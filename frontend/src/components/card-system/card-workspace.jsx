import React, { useState, useRef } from 'react';

import ComponentContainer from '../../utils/component-container';
import CardBody from './card-body';
import Deck from './deck';

import Button from 'react-bootstrap/Button';

const CardWorkspace = (props) => {
    const [cardComponents, setCardComponents] = useState([]);
    const targetComponentRefs = useRef([]);

    const [decks, setDecks] = useState([]);
    
    const registerComponentRef = (ref, component) => {
      if (ref.current && !targetComponentRefs.current.some(item => item.ref.current === ref.current)) {
        targetComponentRefs.current.push({ ref, component });
      }
  };

  const notifyOverlap = (componentRef, component) => {
    if (!componentRef.current) return;

    let rectCompA = componentRef.current.getBoundingClientRect();

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            // Should probably check via isIntersecting instead?
            if (entry.target !== componentRef.current) {
              let rectCompB = entry.target.getBoundingClientRect();

              console.log(`Rectangle A: ${JSON.stringify(rectCompA)}\nRectangle B: ${JSON.stringify(rectCompB)}`)

              let doesOverlap = !(rectCompA.right < rectCompB.left || 
                rectCompA.left > rectCompB.right || 
                rectCompA.bottom < rectCompB.top || 
                rectCompA.top > rectCompB.bottom);

              if (doesOverlap) {
                console.log(`Overlapping components`);
                
                // Temporary, check whether the overlapping card is already part of an existing deck
                // If it is, add to that deck
                // If not then create a new deck with it.
                
                let overlappedComponent = targetComponentRefs.current.find(item => item.ref.current === entry.target);
                if (overlappedComponent) {
                  let cards = [
                    component, 
                    overlappedComponent.component
                  ];
                  setDecks([...decks, { cards: cards }]);
                }

                // componentRef.current.style.zIndex = '1';
                // entry.target.style.zIndex = '0';
              }

              // I think the intersection check has issues, probably gotta fix the root and threshold
              /*
              if (entry.isIntersecting) {
                console.log("Intersecting");
              }*/
            }
        });
    };

    let io = new IntersectionObserver(callback, {
        // root: el,
        threshold: [0, 0.1, 0.95, 1]
    });

    targetComponentRefs.current.forEach(target => {
      if (target.ref.current) {
          io.observe(target.ref.current);
      }
    });

    return () => {
        targetComponentRefs.current.forEach(target => {
          if (target.ref.current) {
              io.unobserve(target.ref.current);
          }
      });
    };
  };

    const addCardComponent = () => {
      setCardComponents([...cardComponents, 
        <ComponentContainer 
          key =  {cardComponents.length}
          id={cardComponents.length}
          registerComponentRef={registerComponentRef}
          notifyOverlap={notifyOverlap}
        >
          <CardBody/>
        </ComponentContainer>
      ])
    }

    const addDeck = () => {
        setDecks([...decks, 
        <ComponentContainer 
            key =  {decks.length}
            id={decks.length}
            registerComponentRef={registerComponentRef}
            notifyOverlap={notifyOverlap}
        >
          <Deck cards = {decks}/>
        </ComponentContainer>
      ])
    }

    return (
    <div>
      <Button variant="primary" onClick={addCardComponent}>
        Add card
      </Button>
      <div>
        {cardComponents.map((cardComponent, index) => (
          <React.Fragment key={index}>{cardComponent}</React.Fragment>
        ))}
      </div>
      <div>
        {decks.map((deck, index) => (
          <Deck key={index} cards={deck.cards} />
        ))}
      </div>
    </div>
  );
}

export default CardWorkspace;