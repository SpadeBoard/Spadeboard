import React, { useState, useEffect, useRef } from "react";
import Rnd from 'react-rnd-rotate-restore';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

const ComponentContainer  = (props) => {
    const { registerComponentRef, notifyOverlap } = props;

    const [disableDragging, setDisableDragging] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [width, setWidth] = useState(200);
    const [height, setHeight] = useState(320);

    const [minWidth, setMinWidth] = useState(0);
    const [minHeight, setMinHeight] = useState(0);

    // Probably should have this and pass those in as arguments
    const [componentMinWidth, setComponentMinWidth] = useState(200);
    const [componentMinHeight, setComponentMinHeight] = useState(320);

    const componentRef = useRef(undefined);

    const HandleDisableDragging = () => {
        setDisableDragging(prevState => !prevState);
    };
    
    const radios = [
        { name: 'Draggable?', value: '1', onClick: HandleDisableDragging}
      ];

    const RndStyle = {
        display: "flex",
        border: "solid 1px #ddd",
        background: "#f0f0f0",
    };

    // So this is here to update every time the resize happens to make sure the container's min width and height updates with it
    const SetComponentContainerMinSize = () => {
        if (componentRef.current) {
            const componentRefWidth = componentRef.current.getBoundingClientRect().width;
            const componentRefHeight = componentRef.current.getBoundingClientRect().height;

            setMinWidth(componentRefWidth);
            setMinHeight(componentRefHeight);

            console.log(`Container dimensions: ${width}px x ${height}px\nComponent dimensions: ${componentRefWidth}px x ${componentRefHeight }px`);

            return true;
        }

        return false;
    };

      const checkOverlap = () => {
        console.log(`X: ${x}, Y: ${y}, ComponentContainer ID: ${props.id}`);

        if (!componentRef.current)
            return;

        // Parent function
        if (!registerComponentRef)
            return;

        registerComponentRef(componentRef, props.children);

        if (!notifyOverlap)
            return;

        notifyOverlap(componentRef, props.children);
      }

    return (
        <Rnd
            // style = {RndStyle}
            position={{ x: x, y: y }}
            minHeight = {minHeight}
            minWidth = {minWidth}
            lockAspectRatio = {true}
            onDragStop={(e, d) => { 
                setX(d.x); 
                setY(d.y); 

                checkOverlap();
            }}
            disableDragging = {disableDragging}
            onResize={(e, direction, ref, delta, position) => {
                setWidth(ref.offsetWidth);
                setHeight(ref.offsetHeight);
                setX(position.x);
                setY(position.y);

                SetComponentContainerMinSize();
            }}
        >
            <div ref = {componentRef}>
                {props.children}
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

export default ComponentContainer;