import { Injectable } from '@angular/core';
import { BorderDimensions, Style } from '../../../../../style/models/style';
import { DEFAULT_CARD_FACE_BORDER_RADIUS, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../../../utils/card-editor.constants';
import { clamp, Dimensions, isDimensions } from '../../../../../../utils/utils';
import { filterAgainstNull, isBorderDimensions } from '../../../../../style/utils/get-style';
import { clampBorderRadius } from '../../../../utils/card-face.constants';

@Injectable({
  providedIn: 'root'
})
export class CardFaceStyleService {

  constructor() { }

  private setBorderDimensions(bd: BorderDimensions, face: Style): void {
    if (!face || !bd)
      return;
    let {
      top,
      bottom,
      left,
      right
    } = bd.borderRect;

    face.borderWidth = `${bd.borderWidth}px`;
    face.borderTopWidth = `${top}px`;
    face.borderBottomWidth = `${bottom}px`;
    face.borderLeftWidth = `${left}px`;
    face.borderRightWidth = `${right}px`;
  }

  public setDimensions(dimensions: Dimensions, face: Style): void;
  public setDimensions(bd: BorderDimensions, face: Style): void;
  public setDimensions(dimension: number, face: Style, property: 'w' | 'h'): void;
  public setDimensions(value: BorderDimensions | Dimensions | number, face: Style, property?: 'w' | 'h'): void {
    if (!face) throw new Error("No style to set dimensions");

    if (typeof value === "number" && property) {
      switch (property) {
        case 'w': {
          this.setWidth(value, face);
          break;
        }
        case 'h': {
          this.setHeight(value, face);
          break;
        }
        default:
          throw new Error("Can't update one dimension only without a property marker");
      }

      return;
    }

    if (isDimensions(value)) {
      let dimensions: Dimensions = value as Dimensions;

      if (!dimensions.width || !dimensions.height) throw new Error("Dimensions does not have a width or height");

      this.setWidth(dimensions.width, face);
      this.setHeight(dimensions.height, face);
      return;
    }

    if (!isBorderDimensions(value)) throw new Error("Border dimensions aren't being passed through");

    let bd: BorderDimensions = value as BorderDimensions;

    this.setBorderDimensions(bd, face);
  }

  private setWidth(width: number, face: Style): void {
    width = clamp(width, MIN_CARD_FACE_WIDTH, MAX_CARD_FACE_WIDTH);

    if (!face) return;

    face.width = `${width}px`;
  }

  private setHeight(height: number, face: Style): void {
    height = clamp(height, MIN_CARD_FACE_HEIGHT, MAX_CARD_FACE_HEIGHT);

    if (!face) return;

    face.height = `${height}px`;
  }

  public getBorderWidthStyle(style: Style | Omit<Style, 'styleId'>): Omit<Style, 'styleId'> {
    let { borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth, borderWidth } = style;

    // ASSUMPTION: All sides will always have a value or no sides have value at all
    if (
      (borderTopWidth === borderRightWidth &&
        borderTopWidth === borderBottomWidth &&
        borderTopWidth === borderLeftWidth)
      ||
      (!borderTopWidth ||
        !borderBottomWidth ||
        !borderLeftWidth ||
        !borderRightWidth
      )
    ) {
      // All sides are equal or missing at least one, use shorthand
      return { borderWidth };
    } else {
      // Sides are not equal, use individual sides
      return {
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth
      };
    }
  }

  public getStyle(face: Style): Omit<Style, 'styleId'> {
    if (!face) throw new Error("No initial style to filter out");

    let { styleId, ...rest } = face;

    let filtered: Omit<Style, "styleId"> = filterAgainstNull(rest);

    // Get the correct border width properties
    let borderWidthProps: Omit<Style, 'styleId'> = this.getBorderWidthStyle(filtered);

    // Remove all border width properties from filtered to avoid duplication
    let {
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderWidth,

      ...other
    } = filtered;

    // Merge the border width props with the rest of the styles
    let final: Omit<Style, "styleId"> = {
      ...other,
      ...borderWidthProps
    };

    // console.log(`Get card editor face style: ${JSON.stringify(final)}`);
    return final;
  }

  // public setColor(radius: number, face: Style, property: 'radius'): void;
  public setColor(color: string, face: Style, property: 'face' | 'edge'): void {
    if (!face) throw new Error("No style to set appearance");

    switch (property) {
      case 'face': {
        this.setFaceColor(color, face);
        break;
      }
      case 'edge': {
        this.setBorderColor(color, face);
        break;
      }
      /*case 'radius': {
        if (typeof appearance !== 'number') throw new Error("Must pass in a radius which is a number");
        this.setBorderRadius(appearance, face);
        break;
      }*/
      default:
        throw new Error("Can't update one dimension only without a property marker");
    }
  }

  private setFaceColor(color: string, face: Style): void {
    if (!face) return;

    face.backgroundColor = color;
  }

  private setBorderColor(color: string, face: Style): void {
    if (!face) return;

    face.borderColor = color;
  }

  public setBorderRadius(radius: number, face: Style): void {
    if (!face) return;

    face.borderRadius = `${clampBorderRadius(radius)}px`;
  }
}
