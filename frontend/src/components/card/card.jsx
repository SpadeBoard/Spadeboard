import React, { useState } from "react";
import ReactCardFlip from 'react-card-flip';
import CardBody from './card-body';

const Card  = (props) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(prevState => !prevState);
    };

    return (
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
      )
}

export default Card;