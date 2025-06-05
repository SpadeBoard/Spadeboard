import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID } from '../utils/card-editor.constants';
import { Coordinates } from '../../../utils/utils';
import { Dimensions } from 'ngx-image-cropper';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignElementAttributesService {
  private onSetMaxHeight$$ = new Subject<number>();
  onSetMaxHeight$: Observable<number> = this.onSetMaxHeight$$.asObservable();

  private onSetMaxWidth$$ = new Subject<number>();
  onSetMaxWidth$: Observable<number> = this.onSetMaxWidth$$.asObservable();

  private onSetWidth$$ = new Subject<number>();
  onSetWidth$: Observable<number> = this.onSetWidth$$.asObservable();

  private onSetHeight$$ = new Subject<number>();
  onSetHeight$: Observable<number> = this.onSetHeight$$.asObservable();

  private onSetY$$ = new Subject<number>();
  onSetY$: Observable<number> = this.onSetY$$.asObservable();

  private onSetX$$ = new Subject<number>();
  onSetX$: Observable<number> = this.onSetX$$.asObservable();

  // currentCardFaceElementId: WritableSignal<number> = signal<number>(-1);
  // https://stackoverflow.com/questions/42504918/difference-between-ngmodel-and-ngmodel-for-binding-state-to-property
  currentCardFaceElementId: string = DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID;

  coordinates: Coordinates = {
    x: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X,
    y: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y
  }

  dimensions: Dimensions = {
    height: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT,
    width: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH
  }

  constructor() { }

  setY(y: number) {
    this.onSetY$$.next(y);
  }
  
  setX(x: number) {
    this.onSetX$$.next(x);
  }

  setMaxHeight(maxHeight: number) {
    this.onSetMaxHeight$$.next(maxHeight);
  }

  setMaxWidth(maxWidth: number) {
    this.onSetMaxWidth$$.next(maxWidth);
  }

  setHeight(height: number) {
    this.onSetHeight$$.next(height);
  }

  setWidth(width: number) {
    this.onSetWidth$$.next(width);
  }

  resetCardFaceElementAttributes() {
    this.currentCardFaceElementId = DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID;

    this.coordinates = {
      x: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X,
      y: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y
    }

    this.dimensions = {
      height: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT,
      width: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH
    }
  }
}
