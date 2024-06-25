import React, { useState, useEffect, useRef } from "react";
import ReactCardFlip from 'react-card-flip';
import Rnd from 'react-rnd-rotate-restore';
import CardBody from './card-body';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

const Card  = (props) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [disableDragging, setDisableDragging] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [width, setWidth] = useState(200);
    const [height, setHeight] = useState(320);

    const [minWidth, setMinWidth] = useState(0);
    const [minHeight, setMinHeight] = useState(0);

    const [cardMinWidth, setCardMinWidth] = useState(200);
    const [cardMinHeight, setCardMinHeight] = useState(320);

    const cardRef = useRef(undefined);

    const frontCardRef = useRef(undefined);
    const backCardRef = useRef(undefined);

    const HandleFlip = () => {
        setIsFlipped(prevState => !prevState);
    };

    const HandleDisableDragging = () => {
        setDisableDragging(prevState => !prevState);
    };
    
    const radios = [
        { name: 'Flip', value: '1', onClick: HandleFlip},
        { name: 'Draggable?', value: '2', onClick: HandleDisableDragging}
      ];

    const RndStyle = {
        display: "flex",
        border: "solid 1px #ddd",
        background: "#f0f0f0",
    };

    // So this is here to update every time the resize happens to make sure the container's min width and height updates with it
    const SetCardContainerMinSize = () => {
        if (cardRef.current) {
            const cardRefWidth = cardRef.current.getBoundingClientRect().width;
            const cardRefHeight = cardRef.current.getBoundingClientRect().height;

            setMinWidth(cardRefWidth);
            setMinHeight(cardRefHeight);

            console.log(`Container dimensions: ${width}px x ${height}px\nCard dimensions: ${cardRefWidth}px x ${cardRefHeight }px`);

            return true;
        }

        return false;
    };

    const CalculateCardBodyAspectRatio = (cardBodyWidth, cardBodyHeight) => {
        return `${cardBodyWidth}/${cardBodyHeight}`;
    }

    /*const setCardContainerMinSizeEffect = useEffect(() => {
        if (cardRef.current) {
            setMinWidth(cardRef.current.getBoundingClientRect().width);
            setMinHeight(cardRef.current.getBoundingClientRect().height);
        }
      }, [x, y]);*/

    return (
        <Rnd
            style = {RndStyle}
            position={{ x: x, y: y }}
            minHeight = {minHeight}
            minWidth = {minWidth}
            lockAspectRatio = {true}
            onDragStop={(e, d) => { setX(d.x); setY(d.y); }}
            disableDragging = {disableDragging}
            onResize={(e, direction, ref, delta, position) => {
                setWidth(ref.offsetWidth);
                setHeight(ref.offsetHeight);
                setX(position.x);
                setY(position.y);

                SetCardContainerMinSize();
            }}
        >
            <div ref = {cardRef}>
                <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                    <CardBody 
                        title="Front"
                        content="This is some example content for the card."
                        imageUrl="https://via.placeholder.com/150"
                        minHeight={cardMinHeight}
                        minWidth={cardMinWidth}
                        aspectRatio= {CalculateCardBodyAspectRatio(466.72, 591.72)}
                    />
                    <CardBody 
                        title="Back"
                        content="Another piece of content."
                        minHeight={cardMinHeight}
                        minWidth={cardMinWidth}
                        aspectRatio= {CalculateCardBodyAspectRatio(466.72, 591.72)}
                    />
                </ReactCardFlip>
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
        </Rnd>
      )
}

export default Card;