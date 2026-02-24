import { Coordinates, Dimensions, stringify } from "../../../utils/utils";
import { CardFaceElement, CardFaceElementPerCardFace } from "../card-face-element/models/card-face-element";

export const DEFAULT_CARD_FACE_ELEMENT_IMAGE_VOLUME_PATH: string = '/app/backend/card-face-elements-images';

export function createCardFaceElementPerCardFace(cardFaceElementPerCardFaceId: string, type: string, dndPosition: Coordinates) {
  let cardFaceElementPerCardFace: CardFaceElementPerCardFace = {
    cardFaceElementPerCardFaceId: cardFaceElementPerCardFaceId,
    cardFaceElement: {
      cardFaceElementType: 'Rt',
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
    case 'Rt':
      cardFaceElementPerCardFace = {
        cardFaceElementPerCardFaceId: cardFaceElementPerCardFaceId,
        cardFaceElement: {
          cardFaceElementType: 'Rt',
          cardFaceElementId: cardFaceElementPerCardFaceId,
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
          cardFaceElementId: cardFaceElementPerCardFaceId,
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

export function areCardFaceElementsIdsUnique(cardFaceElements: Array<CardFaceElement[]>): boolean {
  let all: string[] = cardFaceElements.flatMap((value: CardFaceElement[]) => value.map((elem: CardFaceElement) => elem.cardFaceElementId));
  return all.length === new Set(all).size;
}

export function assertCardFaceElements(cardFaceElements: Map<string, CardFaceElement[]>): boolean {
  let log: string = `${assertCardFaceElements.name}:\n`;

  cardFaceElements.forEach((value: CardFaceElement[], key: string) => {
    log += (`${key}: ${stringify(value)}\n`);
  });

  console.log('%c' + log, `color: #4C9085; background: #98ffe7ff; padding: 5px; border-radius: 5px;`);

  let values: Array<CardFaceElement[]> = Array.from(cardFaceElements.values());

  let uniqueIds: boolean = areCardFaceElementsIdsUnique(values);

  console.assert(uniqueIds, `${assertCardFaceElements.name}: Card face elements share IDs`, { values });

  return uniqueIds;
}

export const DEFAULT_CARD_FACE_ELEMENTDIMENSIONS: Dimensions = {
  width: 100,
  height: 100
}