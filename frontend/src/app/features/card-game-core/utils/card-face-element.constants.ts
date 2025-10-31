import { Coordinates } from "../../../utils/utils";
import { CardFaceElementPerCardFace } from "../models/card-face-element";

export function createCardFaceElementPerCardFace(cardFaceElementPerCardFaceId: string, type: string, dndPosition: Coordinates) {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = {
      cardFaceElementPerCardFaceId: cardFaceElementPerCardFaceId,
      cardFaceElement: {
        cardFaceElementType: 'Rte',
        cardFaceElementId: cardFaceElementPerCardFaceId,
        style: {
          styleId: "0",
          zIndex: '1'
        },
      },
      dndItem: {
        dndItemId: "0",
        isDraggable: false,
        isDroppable: false,
        isRotatable: false
      },
      dndPosition: 
      {
        dndPositionId: "0",
        ...dndPosition
      }
    }

    switch (type) {
      case 'Rte':
        cardFaceElementPerCardFace = {
          cardFaceElementPerCardFaceId: cardFaceElementPerCardFaceId,
          cardFaceElement: {
            cardFaceElementType: 'Rte',
            cardFaceElementId:  cardFaceElementPerCardFaceId,
            style: {
              styleId: "0",
              width: '100', // TODO: Set this for Angular Editor
              height: '100', // TODO: Set this for Angular Editor
              zIndex: '1'
            }
          },
          dndItem: {
            dndItemId: "0",
            isDraggable: false,
            isDroppable: false,
            isRotatable: false
          },
          dndPosition:
          {
            dndPositionId: "0",
            ...dndPosition
          }
        }
        break;
      case 'Image':
        cardFaceElementPerCardFace = {
          cardFaceElementPerCardFaceId: cardFaceElementPerCardFaceId,
          cardFaceElement: {
            cardFaceElementType: 'Image',
            cardFaceElementId:  cardFaceElementPerCardFaceId,
            style: {
              styleId: "0",
              width: '100', // Modify
              height: '100', //Modify
              zIndex: '1'
            }
          },
          dndItem: {
            dndItemId: "0",
            isDraggable: false,
            isDroppable: false,
            isRotatable: false
          },
         dndPosition:
          {
            dndPositionId: "0",
            ...dndPosition
          }
        }
        break;
      default:
        // console.log("Default");
        break;
    }

    return cardFaceElementPerCardFace;
  }