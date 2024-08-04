import React, { useState } from "react";
import ReactCardFlip from 'react-card-flip';
import CardInfo from './card-info';

import ActionsContextMenu from '../../utils/actions-context-menu';

const CardBody = (props) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const [cardMinWidth, setCardMinWidth] = useState(182);
    const [cardMinHeight, setCardMinHeight] = useState(320);

    const [cardWidth, setCardWidth] = useState(182);
    const [cardHeight, setCardHeight] = useState(320);

    const HandleFlip = () => {
        setIsFlipped(prevState => !prevState);
    };

    const actionsContextMenuItems = [
        { name: 'Flip', onClick: HandleFlip }
    ];

    const CalculateCardInfoAspectRatio = (cardBodyWidth, cardBodyHeight) => {
        return `${cardBodyWidth}/${cardBodyHeight}`;
    }

    const CardFaces = (props) => {
        return <>
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                <CardInfo
                    title="Front"
                    content="This is some example content for the card."
                    imageUrl="https://via.placeholder.com/150"
                    minHeight={cardMinHeight}
                    minWidth={cardMinWidth}
                    aspectRatio={CalculateCardInfoAspectRatio({ cardWidth }, { cardHeight })}
                    height={cardHeight}
                    width={cardWidth}
                />
                <CardInfo
                    title="Back"
                    content="Another piece of content."
                    minHeight={cardMinHeight}
                    minWidth={cardMinWidth}
                    aspectRatio={CalculateCardInfoAspectRatio({ cardWidth }, { cardHeight })}
                    height={cardHeight}
                    width={cardWidth}
                />
            </ReactCardFlip>
        </>
    }

    return (
        <>
            <CardFaces />
            <ActionsContextMenu contextMenuItemsId={"card-body"} contextMenuItems={actionsContextMenuItems} />
        </>
    )
}

export default CardBody;