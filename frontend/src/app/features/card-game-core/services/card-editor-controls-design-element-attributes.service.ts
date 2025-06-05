import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID } from '../utils/card-editor.constants';
import { Coordinates } from '../../../utils/utils';
import { Dimensions } from 'ngx-image-cropper';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignElementAttributesService {
  private onSetWidth$$ = new Subject<number>();
  onSetWidth$: Observable<number> = this.onSetWidth$$.asObservable();

  private onSetHeight$$ = new Subject<number>();
  onSetHeight$: Observable<number> = this.onSetHeight$$.asObservable();

  private onSetY$$ = new Subject<number>();
  onSetY$: Observable<number> = this.onSetY$$.asObservable();

  private onSetX$$ = new Subject<number>();
  onSetX$: Observable<number> = this.onSetX$$.asObservable();

  private onResetCardFaceAttributes$$ = new Subject<{coordinates: Coordinates, dimensions: Dimensions}>();
  onResetCardFaceAttributes$: Observable<{coordinates: Coordinates, dimensions: Dimensions}> = this.onResetCardFaceAttributes$$.asObservable();

  currentCardFaceElementId: WritableSignal<string> = signal<string>(DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);
  // https://stackoverflow.com/questions/42504918/difference-between-ngmodel-and-ngmodel-for-binding-state-to-property


  constructor() { }

  setY(y: number) {
    this.onSetY$$.next(y);
  }
  
  setX(x: number) {
    this.onSetX$$.next(x);
  }

  setHeight(height: number) {
    this.onSetHeight$$.next(height);
  }

  setWidth(width: number) {
    this.onSetWidth$$.next(width);
  }

  resetCardFaceElementAttributes() {
    this.currentCardFaceElementId.set(DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

    let coordinates: Coordinates = {
      x: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X,
      y: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y
    }

    let dimensions: Dimensions = {
      height: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT,
      width: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH
    }

    this.onResetCardFaceAttributes$$.next(
      {
        coordinates: coordinates,
        dimensions: dimensions
      }
    )
  }
}
