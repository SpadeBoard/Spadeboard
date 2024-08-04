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
      id: "card-portal-node"
    }
  });

  const [deckData, setDeckData] = useState([]);
  const [doesDeckExist, setDoesDeckExist] = useState(false);
  const [deckPortalNodes, setDeckPortalNodes] = useState([]);

  const registerComponentRef = (ref, component, id) => {
    if (ref.current && !targetComponentRefs.current.some(item => item.ref.current === ref.current)) {
      console.log(`Id: ${id}`);

      targetComponentRefs.current.push(
        {
          ref,
          component,
          id
        }
      );
    }
  };

  // Genuinely need to fix this, I doubt I'm using IOs correctly
  const notifyOverlap = (componentRef, component, componentContainerId) => {
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
              // Question is how do we grab the overlapped component when it's already inside deck
              // This is why I think we need a different alternative to IOs, or as I've said, I might be misunderstanding IOs 


              let cardsIds = [
                componentContainerId,
                overlappedComponent.id,
              ];

              console.log(`Component id: ${componentContainerId}\nOverlapped component id: ${overlappedComponent.id}`);

              // Grab the actual card data based on these cards
              // They should already have ids which are being referenced though

              addDeckData(cardsIds);
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

  const addCardData = (portalNodeId) => {
    setCardData([...cardData, {
      id: cardData.length,
      portalNodeId: portalNodeId
    }]);
  }

  // There could be multiple decks simultaneously
  // This should probably be function for creating new deck
  // and another function for adding card to existing deck
  const addDeckData = (cardsIds) => {
    const deckPortalNode = createHtmlPortalNode({
      attributes: {
        id: `deck-portal-node_${deckData.length}`
      }
    });

    // Store this info to compare ids
    setDeckPortalNodes([...deckPortalNodes,
      deckPortalNode
    ])

    // Keep track of portalNodeId to match and render cards with that same portal node
    setDeckData([...deckData,
    {
      key: deckData.length,
      id: deckData.length,
      cardsIds: cardsIds,
      portalNodeId: deckPortalNode.element.attributes.id.value
    }
    ]);

    updateCardInPortalIds(cardsIds, deckPortalNode);
  }

  const updateCardInPortalIds = (cardsIds, portalNode) => {
    setCardData(prevCardData => prevCardData.map(cardDatum => (
      cardsIds.some(cardId => cardId === cardDatum.id) ? { ...cardDatum, portalNodeId: portalNode.element.attributes.id.value } : cardDatum
    )));
  }

  const GenerateCards = (props) => {
    return <div>
      {props.cardData.map((cardDatum, index) => (
        <ComponentContainer
          key={cardDatum.id}
          id={cardDatum.id}
          registerComponentRef={registerComponentRef}
          notifyOverlap={notifyOverlap}
          disableDragging={props.disableDragging}
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
    return <div id="cards">
      {doesCardExist === true && props.cardData.filter(cardDatum => cardDatum.portalNodeId === props.portalNode.element.attributes.id.value).map(cardDatum => (
        <OutPortal key={cardDatum.id} node={props.portalNode} />
      ))}
    </div>
  }

  const RenderCards = (props) => {
    return (
      <>
        {doesCardExist === true && (
          <>
            {/*InPortal for cards*/}
            <RenderInPortal node={props.cardPortalNode}>
              <GenerateCards cardData={props.cardData.filter(card => card.portalNodeId === props.cardPortalNode.element.attributes.id.value)} />
            </RenderInPortal>

            {/*OutPortal - Render cards here when they aren't in deck*/}
            <CardsOutPortal portalNode={props.cardPortalNode} cardData={props.cardData} />
          </>
        )}
      </>
    )
  }

  const RenderDeck = (props) => {
    const getDeckPortalNodeById = (portalNodeId) => {
      return props.deckPortalNodes.find(node => node.element.attributes.id.value === portalNodeId);
    };

    return (
      <>
        {/*InPortal for decks
          Pass in all deck portal nodes ids, iterate over them*/}
        {doesDeckExist === true && (
          <>
            {/* Render InPortal for each deck - might wanna modify this later for context sensivity, holding down to drag entire deck vs only drawing 1 card*/}
            {props.deckPortalNodes.map((deckPortalNode, index) => (
              <InPortal key={index} node={deckPortalNode}>
                <GenerateCards cardData={props.cardData.filter(card => card.portalNodeId === deckPortalNode.element.attributes.id.value)} disableDragging={true} />
              </InPortal>
            ))}

            {/* Render decks*/}
            {props.deckData.map((deckDatum, index) => {
              const deckPortalNode = getDeckPortalNodeById(deckDatum.portalNodeId);
              return (
                <Deck key={index} cards={deckDatum.cards} portalNode={deckPortalNode} />
              );
            })}
          </>
        )}
      </>
    );
  }

  const updatePortals = useEffect(() => {
    setDoesCardExist(cardData.length > 0);
    setDoesDeckExist(deckData.length > 0);
  }, [cardData, deckData]);

  return (
    <>
      <Button variant="primary" onClick={() => addCardData(cardPortalNode.element.attributes.id.value)}>
        Add card
      </Button>

      <RenderCards cardPortalNode={cardPortalNode} cardData={cardData} />

      {/*Render decks on overlap*/}
      <RenderDeck deckData={deckData} deckPortalNodes={deckPortalNodes} cardData={cardData} />
    </>
  );
}

export default CardWorkspace;