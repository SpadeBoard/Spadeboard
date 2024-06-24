import React, { useState } from "react";
import ReactCardFlip from 'react-card-flip';
import Rnd from 'react-rnd-rotate-restore';
import CardBody from './card-body';

const Card  = (props) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [width, setWidth] = useState(320);
    const [height, setHeight] = useState(200);

    const handleFlip = () => {
        setIsFlipped(prevState => !prevState);
    };

    return (
        <Rnd
            size={{ width: width, height: height }}
            position={{ x: x, y: y }}
            onDragStop={(e, d) => { setX(d.x); setY(d.y); }}
            onResize={(e, direction, ref, delta, position) => {
            setWidth(ref.offsetWidth);
            setHeight(ref.offsetHeight);
            setX(position.x);
            setY(position.y);
            }}
        >
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                <button onClick={handleFlip}>
                    <CardBody 
                        title="Front"
                        content="This is some example content for the card."
                        imageUrl="https://via.placeholder.com/150"
                    />
                </button>
                <button onClick={handleFlip}>
                    <CardBody 
                        title="Back"
                        content="Another piece of content."
                    />
                </button>
            </ReactCardFlip>
        </Rnd>
      )
}

export default Card;