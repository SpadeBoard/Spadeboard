import { Dimensions } from "ngx-image-cropper";
import { Style } from "../../style/models/style";
import { CardEditorCardDto } from "../models/card";
import { CardFaceImage } from "./card-face.utils";
import { getDefaultCardFace } from "./card-face.constants";
import { clamp } from "../../../utils/utils";

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
        currentCardFaceIndex: 0,
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
          cardFace: getDefaultCardFace("-1", { ...style }),
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

export function getDefaultCardFaceElementImage(): CardFaceImage {
  return  {
    src: '/card-editor-controls_card-face-elements-list_image-element-icon.svg',
    alt: 'Placeholder square image',
    dimensions: {
      width: 100,
      height: 100
    }
  };
}

export const DEFAULT_ATLAS_EXPORT_LOD: number = clamp(0, 0, 4);