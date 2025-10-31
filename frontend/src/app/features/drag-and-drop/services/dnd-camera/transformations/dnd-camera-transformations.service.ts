import { Injectable } from '@angular/core';
import { Coordinates } from '../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class DndCameraTransformationsService {
  private readonly IDENTITY_MATRIX: number[][] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];

  constructor() { }

  private getTransformation(transformation: 'translation' | 'rotation' | 'scale', coordinate: Coordinates): Coordinates {
    switch (transformation) {
      case 'translation': {
        return {
          x: (coordinate.x + this.IDENTITY_MATRIX[0][3]),
          y: (coordinate.y + this.IDENTITY_MATRIX[1][3])
        }
      }
      case 'rotation': {
        return {
          x: (coordinate.x * this.IDENTITY_MATRIX[0][0]) + (coordinate.y * this.IDENTITY_MATRIX[0][1]),
          y: (coordinate.x * this.IDENTITY_MATRIX[1][0]) + (coordinate.y * this.IDENTITY_MATRIX[1][1])
        }
      }
      case 'scale': {
        return {
          x: (coordinate.x * this.IDENTITY_MATRIX[0][0]),
          y: (coordinate.y * this.IDENTITY_MATRIX[1][1])
        }
      }
      default:
        throw new Error("Unsupported transformation");
    }
  }

  // v' = Mv + b
  /*************** TRANSLATION *********************/
  private getTranslationVector(initial: Coordinates, final: Coordinates): Coordinates {
    return {
      x: final.x - initial.x,
      y: final.y - initial.y
    }
  }

  private setTranslationMatrix(delta: Coordinates): void {
    this.IDENTITY_MATRIX[0][3] = this.IDENTITY_MATRIX[0][3] + delta.x;
    this.IDENTITY_MATRIX[1][3] = this.IDENTITY_MATRIX[1][3] + delta.y;
  }

  public translate(coordinate: Coordinates, delta: Coordinates): Coordinates {
    this.setTranslationMatrix(delta);

    return this.getTransformation('translation', coordinate);
  }

  /*************** TRANSLATION *********************/

  /*
  [ xcosθ  - ysinθ
    xsinθ  + ycosθ]
  */

  private setRotationMatrix(theta: number): void {
    this.IDENTITY_MATRIX[0][0] = Math.cos(theta);
    this.IDENTITY_MATRIX[0][1] = -Math.sin(theta);
    this.IDENTITY_MATRIX[1][0] = Math.sin(theta);
    this.IDENTITY_MATRIX[1][1] = Math.cos(theta);
  }

  // NOTE: Theta is in radians typically
  public rotate(coordinate: Coordinates, theta: number): Coordinates {
    // ROTATION
    this.setRotationMatrix(theta);

    // MATRIX MULTIPLICATION
    return this.getTransformation('rotation', coordinate);
  }


  private setScaleMatrix(scale: Coordinates): void {
    this.IDENTITY_MATRIX[0][0] = scale.x;
    this.IDENTITY_MATRIX[1][1] = scale.y;
  }

  public scale(coordinate: Coordinates, scale: Coordinates): Coordinates {
    this.setScaleMatrix(scale);

    return this.getTransformation('scale', coordinate);
  }
}
