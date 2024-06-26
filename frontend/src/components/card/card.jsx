import React, { useState } from "react";
import ReactCardFlip from 'react-card-flip';
import CardBody from './card-body';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

const Card  = (props) => {
    const [isFlipped, setIsFlipped] = useState(false);
   
    const [cardMinWidth, setCardMinWidth] = useState(200);
    const [cardMinHeight, setCardMinHeight] = useState(320);

    const HandleFlip = () => {
        setIsFlipped(prevState => !prevState);
    };

    const radios = [
        { name: 'Flip', value: '1', onClick: HandleFlip}
      ];

    const CalculateCardBodyAspectRatio = (cardBodyWidth, cardBodyHeight) => {
        return `${cardBodyWidth}/${cardBodyHeight}`;
    }

    return (
        <div>
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
      )
}

export default Card;