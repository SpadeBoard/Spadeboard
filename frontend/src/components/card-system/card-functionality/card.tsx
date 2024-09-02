// File: components/card/card-body.tsx

import React, { useState, useCallback } from "react";
import ReactCardFlip from 'react-card-flip';

import { DndItemChildrenProps } from "../../../utils/dnd/dnd-interfaces";

interface CardFaceProps extends DndItemChildrenProps {
    width?: number | string;
    height?: number | string;

    isFlipped: boolean;
    isInZone?: boolean;

    children?: React.ReactNode;
}

interface CardStyleProps {
    top?: string;
    left?: string;
    position?: string;
}

const Card: React.FC<CardFaceProps> = React.memo(({
    dndItemId,
    width,
    height,

    isFlipped,
    isInZone,
}) => {

    const asChildOfZoneStyle: React.CSSProperties = {
        position: `absolute`,
        top: `0%`,
        left: `0%`
    };

    const cardFaceStyle: React.CSSProperties = {
        backgroundColor: {isFlipped} ? `lightblue` : `red`,
        left: `0%`,
        top: `0%`,
        position: 'absolute',
        width: (width) ? `${width}` : 'fit-content',
        height: (height) ? `${height}` : 'fit-content',
    };

    const CardFace = React.memo((): JSX.Element => {
        return (
            <div style={cardFaceStyle}>
                {dndItemId}
            </div>
        );
    });

    return (
        <div style={isInZone ? asChildOfZoneStyle : undefined}>
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                <CardFace />
                <CardFace />
            </ReactCardFlip>
        </div>
    );
});

export default Card;