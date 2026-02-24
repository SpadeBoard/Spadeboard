import { Dimensions } from "ngx-image-cropper";
import { clamp, stringify } from "../../../../utils/utils";
import { Style } from "../../../style/models/style";
import { Card } from "../../card/models/card";
import { CardEditorCardDto } from "../models/card-editor-card-dto";
import { CardEditorCardFaceDto } from "../models/card-editor-card-face-dto";
import { getDefaultCardFace } from "../../card-face/constants/card-face.constants";
import { CardFaceImage } from "../../card-face/utils/card-face.utils";
import { isCardEditorCardFaceDtoArray } from "../../utils/card-game-core.utils";
import { DndPosition } from "../../../drag-and-drop/models/dnd-position";

export const MAX_CURRENT_ELEMENTS_PER_CARD_FACE: number = 20;
export const MIN_CARD_FACE_WIDTH: number = 20;
export const MIN_CARD_FACE_HEIGHT: number = 20;
export const MAX_CARD_FACE_WIDTH: number = 500;
export const MAX_CARD_FACE_HEIGHT: number = 800;
export const MIN_BORDER_RADIUS: number = 0;
export const MAX_BORDER_RADIUS: number = 100;
export const MIN_BORDER_WIDTH: number = 0;
export const MAX_BORDER_WIDTH: number = 100;

export const DEFAULT_CARD_FACE_WIDTH: number = 351;
export const DEFAULT_CARD_FACE_HEIGHT: number = 483;
export const DEFAULT_CARD_FACE_BACKGROUND_COLOR: string = "#fefffe";
export const DEFAULT_CARD_FACE_BORDER_COLOR: string = "#fefffe";
export const DEFAULT_CARD_FACE_BORDER_WIDTH: number = 2;
export const DEFAULT_CARD_FACE_BORDER_RADIUS: number = 10;

export function getDefaultCardEditorCardFaceDimensions(): Dimensions {
  return {
    width: DEFAULT_CARD_FACE_WIDTH,
    height: DEFAULT_CARD_FACE_HEIGHT
  }
}

// CHECKME: Move somewhere else?
export const DEFAULT_MODAL_STYLE: Omit<Style, 'styleId'> = {
  position: 'fixed',
  top: '5%',
  left: '5%',
  maxHeight: `90vh`,
  maxWidth: `90vw`,
  borderRadius: '15px',
  backgroundColor: `#e7e7e6`,
  padding: '1%'
}

export const DEFAULT_CARD_EDITOR_FACE_STYLE: Style = {
  styleId: "0",
  backgroundColor: DEFAULT_CARD_FACE_BACKGROUND_COLOR,
  width: `${DEFAULT_CARD_FACE_WIDTH}px`,
  height: `${DEFAULT_CARD_FACE_HEIGHT}px`,
  minWidth: `${MIN_CARD_FACE_WIDTH}px`,
  minHeight: `${MIN_CARD_FACE_HEIGHT}px`,
  maxWidth: `${MAX_CARD_FACE_WIDTH}px`,
  maxHeight: `${MAX_CARD_FACE_HEIGHT}px`,
  display: 'block',
  position: 'relative',
  borderRadius: `${DEFAULT_CARD_FACE_BORDER_RADIUS}px`,
  borderStyle: 'solid', // Set border left width, etc.
  borderColor: DEFAULT_CARD_FACE_BORDER_COLOR,
  borderWidth: `${DEFAULT_CARD_FACE_BORDER_WIDTH}px`,
  fontSize: '14px'
}

export function getBlankCardTemplate(style: Style, newOwnerId: string): CardEditorCardDto {
  return {
    card: {
      cardId: "0",
      currentCardFaceId: "0",
      cardName: ''
    },
    ownerId: newOwnerId,
    cardEditorCardFacesDto: [
      {
        cardFace: getDefaultCardFace("0", { ...style }),
        cardFaceElementsPerCardFace: [],
        fileMetadataLods: []
      },
      {
        cardFace: getDefaultCardFace("1", { ...style }),
        cardFaceElementsPerCardFace: [],
        fileMetadataLods: []
      }
    ],
    tagNames: []
  };
}

export const DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID: string = "";
export const DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X: number = 0;
export const DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y: number = 0;
export const DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH: number = 0;
export const DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT: number = 0;

export const DEFAULT_CARD_FACE_ELEMENT_POSITION: Omit<DndPosition, 'dndPositionId'> = {
  x: 0,
  y: 0
};

export function getDefaultCardFaceElementImage(): CardFaceImage {
  return {
    src: '/image-element-icon.svg',
    alt: 'Placeholder square image',
    dimensions: {
      width: 100,
      height: 100
    }
  };
}

export const DEFAULT_ATLAS_EXPORT_LOD: number = clamp(0, 0, 4);

/************* CARD FACE ID **************/
export function getCurrentCardFaceId(card: Card): string {
  return card.currentCardFaceId;
}

export function getCurrentCardFaceIndex(currentCardFaceId: string, cardEditorCardFacesDto: CardEditorCardFaceDto[]): number;
export function getCurrentCardFaceIndex(currentCardFaceId: string, cardFaceIds: string[]): number;
export function getCurrentCardFaceIndex(currentCardFaceId: string, cardFacesCollection: CardEditorCardFaceDto[] | string[]): number {
  if (isCardEditorCardFaceDtoArray(cardFacesCollection)) return cardFacesCollection.findIndex((cardFacesCollection: CardEditorCardFaceDto) => cardFacesCollection.cardFace.cardFaceId === currentCardFaceId);

  return cardFacesCollection.findIndex((cardFacesCollection: string) => cardFacesCollection === currentCardFaceId);
}

// TODO: Modify this depending on how many faces we have
export function setCurrentCardFaceId(currentCardFaceIndex: number,cardEditorCardFacesDto: CardEditorCardFaceDto[]): string;
export function setCurrentCardFaceId(currentCardFaceIndex: number,cardFaceIds: string[]): string;
export function setCurrentCardFaceId(currentCardFaceIndex: number,cardFacesCollection: CardEditorCardFaceDto[] | string[]): string {
  let idx: number = currentCardFaceIndex === 0 ? 1 : 0;

  if (isCardEditorCardFaceDtoArray(cardFacesCollection)) {
    return cardFacesCollection[idx].cardFace.cardFaceId;
  }

  return cardFacesCollection[idx];
}
/**********************************/

/******************** IMPORT ***********************/
export function shouldMakeCardFaceThumbnailLods(cardEditorCardFaceDto: CardEditorCardFaceDto): boolean {
  let arg: Omit<Style, 'styleId'> = omit(cardEditorCardFaceDto.cardFace.style, "styleId");
  let base: Omit<Style, 'styleId'> = omit(DEFAULT_CARD_EDITOR_FACE_STYLE, "styleId");

  return cardEditorCardFaceDto.cardFaceElementsPerCardFace.length > 0 || stringify(arg) !== stringify(base);
}

// TODO: Move somewhere else
export function omit<T extends Record<string, any>, K extends (keyof T)[]>(
  obj: T,
  ...keys: K
): Omit<T, K[number]> {
  let ret: Partial<T> = {};
  let exclude: Set<string> = new Set(keys as string[]);

  for (let key in obj) {
    if (!exclude.has(key)) {
      ret[key as keyof T] = obj[key as keyof T];
    }
  }
  return ret as Omit<T, K[number]>;
}