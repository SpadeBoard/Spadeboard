import React, { useState } from "react";
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
    const [width, setWidth] = useState(320);
    const [height, setHeight] = useState(200);

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

    return (
        <Rnd
            style = {RndStyle}
            position={{ x: x, y: y }}
            onDragStop={(e, d) => { setX(d.x); setY(d.y); }}
            disableDragging = {disableDragging}
            onResize={(e, direction, ref, delta, position) => {
                // setWidth(ref.offsetWidth);
                // setHeight(ref.offsetHeight);
                setX(position.x);
                setY(position.y);
            }}
        >
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                <div>
                    <CardBody 
                        title="Front"
                        content="This is some example content for the card."
                        imageUrl="https://via.placeholder.com/150"
                    />
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
                <div>
                    <CardBody 
                        title="Back"
                        content="Another piece of content."
                    />
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
            </ReactCardFlip>
        </Rnd>
      )
}

export default Card;