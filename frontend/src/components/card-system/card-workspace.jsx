import React, { useState, useRef, useEffect } from 'react';

import ComponentContainer from '../../utils/component-container';
import CardBody from './card-body';
import Deck from './deck';

import Button from 'react-bootstrap/Button';

import { createHtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';

const CardWorkspace = (props) => {
    const [cardData, setCardData] = useState([]);
    const [doesCardExist, setDoesCardExist] = useState(false);

    const targetComponentRefs = useRef([]);

    const cardPortalNode = createHtmlPortalNode({
      attributes: { 
        id: "card"}
    });

    const [deckData, setDeckData] = useState([]);
    const [doesDeckExist, setDoesDeckExist] = useState(false);
    
    const registerComponentRef = (ref, component) => {
      if (ref.current && !targetComponentRefs.current.some(item => item.ref.current === ref.current)) {
        targetComponentRefs.current.push({ ref, component, id: component.props.id });
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
                // Temporary, check whether the overlapping card is already part of an existing deck
                // If it is, add to that deck
                // If not then create a new deck with it.
                
                let overlappedComponent = targetComponentRefs.current.find(item => item.ref.current === entry.target);

                if (overlappedComponent) {
                  let cards = [
                    component, 
                    overlappedComponent.component,
                  ];

                  addDeckData(cards);
                }
              }
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
  };

    const addCardData = () => {  
      setCardData([...cardData, {
        id: cardData.length,
      }]);
    }

    // There could be multiple decks simultaneously
    // This should probably be function for creating new deck
    // and another function for adding card to existing deck
    const addDeckData = (cards) => {
      const deckPortalNode = createHtmlPortalNode({
        attributes: { 
          id: "deck ${deckData.length}"}
      });

      setDeckData([...deckData, 
        {
            key: deckData.length,
            id: deckData.length,
            cards: cards
        }
      ]);

      // How to now shift cards based on their index to this new InPortalNode
      updateCardPortalsToDeckPortal(cards, deckPortalNode);
    }

    const updateCardPortalsToDeckPortal = (cards, deckPortalNode) => {
      // Not sure what to do here, I think I need to somehow change the InPortal the overlapping components belong to
      // And then also store that portal node and then pass it as a prop
  }

    const GenerateCards = (props) => {
      return <div>
        {props.cardData.map((cardDatum, index) => (
          <ComponentContainer
            key={cardDatum.id}
            id={cardDatum.id}
            registerComponentRef={registerComponentRef}
            notifyOverlap = {notifyOverlap}
          >
            <CardBody />
          </ComponentContainer>
        ))}
      </div>
    }

    const RenderInPortal = (props) => {
      return <InPortal node={props.node}>
        {props.children}
      </InPortal>
    }

    const CardsOutPortal = (props) => {
      return <div id = "cards">
        {doesCardExist === true && <OutPortal node={props.node}/>}
      </div>
    }

    const RenderDeck = (props) => {
      return (
        <>
          {doesDeckExist === true && props.deckData.map((deckDatum, index) => (
            <Deck key={index} cards = {deckDatum.cards} node={deckDatum.portalNode} />
          ))}
        </>
      );
    }

    const updatePortals = useEffect(() => {
      if (cardData.length > 0) {
        setDoesCardExist(true);
      }
      else {
        setDoesCardExist(false);
      }

      /*if (deckData.length > 0) {
        setDoesDeckExist(true);
      }
      else {
        setDoesDeckExist(false);
      }*/

    }, [cardData, deckData]);

    return (
    <div>
      <Button variant="primary" onClick={addCardData}>
        Add card
      </Button>

      <RenderInPortal node={cardPortalNode}>
        <GenerateCards cardData={cardData}/>
      </RenderInPortal>

      {/*Render cards here when they aren't in deck*/}
      <CardsOutPortal node ={cardPortalNode}/>

      {/*Render decks on overlap*/}
      <RenderDeck deckData = {deckData}/>
    </div>
  );
}

export default CardWorkspace;