import { DestroyRef, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dimensions } from 'ngx-image-cropper';
import { distinctUntilChanged, map, merge, Observable, Subject, Subscription } from 'rxjs';
import { Coordinates, unsubscription } from '../../../../../../../../../utils/utils';
import { CardFaceElementPerCardFace } from '../../../../../../../card-face-element/models/card-face-element';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID } from '../../../../../../../card-editor/constants/card-editor.constants';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignElementAttributesService {
  private setWidth$$: Subject<number> = new Subject<number>();
  public readonly setWidth$: Observable<number> = this.setWidth$$.asObservable();

  private setHeight$$: Subject<number> = new Subject<number>();
  public readonly setHeight$: Observable<number> = this.setHeight$$.asObservable();

  private setY$$: Subject<number> = new Subject<number>();
  public readonly setY$: Observable<number> = this.setY$$.asObservable();

  private setX$$: Subject<number> = new Subject<number>();
  public readonly setX$: Observable<number> = this.setX$$.asObservable();

  private resetedElementAttributes$$: Subject<{ coordinates: Coordinates, dimensions: Dimensions }> = new Subject<{ coordinates: Coordinates, dimensions: Dimensions }>();
  public readonly resetedElementAttributes$: Observable<{ coordinates: Coordinates, dimensions: Dimensions }> = this.resetedElementAttributes$$.asObservable();

  private setElementAttributes$$: Subject<string> = new Subject<string>();
  public readonly setElementAttributes$: Observable<string> = this.setElementAttributes$$.asObservable();

  public $currentCardFaceElementId: WritableSignal<string> = signal<string>(DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);
  // https://stackoverflow.com/questions/42504918/difference-between-ngmodel-and-ngmodel-for-binding-state-to-property

  constructor() { }

  public setY(y: number): void {
    this.setY$$.next(y);
  }

  public setX(x: number): void {
    this.setX$$.next(x);
  }

  public setHeight(height: number): void {
    this.setHeight$$.next(height);
  }

  public setWidth(width: number): void {
    this.setWidth$$.next(width);
  }

  public setElementAttributes(id: string): void {
    this.setElementAttributes$$.next(id);
  }

  public resetElementAttributes(): void {
    this.$currentCardFaceElementId.set(DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

    let coordinates: Coordinates = {
      x: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X,
      y: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y
    }

    let dimensions: Dimensions = {
      height: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT,
      width: DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH
    }

    this.resetedElementAttributes$$.next(
      {
        coordinates: coordinates,
        dimensions: dimensions
      }
    )
  }

  public setElementAttributesPosition(position: Coordinates): void {
    this.setX(position.x);
    this.setY(position.y);
  }

  public setElementAttributesDimensions(dimensions: Dimensions): void {
    this.setWidth(dimensions.width);
    this.setHeight(dimensions.height);
  }

  public onCardFaceElementAttributes(cardFaceElementPerCardFace: CardFaceElementPerCardFace, destroyRef: DestroyRef): Subscription {
    // TODO: When the element attributes change here, you'd then reapply it back to the current card face ID
    return merge(
      this.setWidth$.pipe(
        map((value: number) => ({ property: 'w', value }))
      ),
      this.setHeight$.pipe(
        map((value: number) => ({ property: 'h', value }))
      ),
      this.setX$.pipe(
        map((value: number) => ({ property: 'x', value }))
      ),
      this.setY$.pipe(
        map((value: number) => ({ property: 'y', value }))
      )
    ).pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(destroyRef)
    )
      .subscribe((attribute: { property: string, value: number }) => {
        if (!cardFaceElementPerCardFace || !cardFaceElementPerCardFace.cardFaceElement.style) throw new Error("No currently edited card face element");

        // console.log(`On card face element attributes - card face element per card face ID: ${cardFaceElementPerCardFace.cardFaceElementPerCardFaceId}, card face element ID: ${cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId}`);

        let { property, value } = attribute;

        switch (property) {
          case 'x': {
            cardFaceElementPerCardFace.dndPosition.x = value;
            break;
          }
          case 'y': {
            cardFaceElementPerCardFace.dndPosition.y = value;
            break;
          }
          case 'w': {
            cardFaceElementPerCardFace.cardFaceElement.style.width = `${value}px`;
            break;
          }
          case 'h': {
            cardFaceElementPerCardFace.cardFaceElement.style.height = `${value}px`;
            break;
          }
          default:
            throw new Error("Unsupported element attribute to update");
        }
      });
  }

  // CHECKME: Problem is there's no getCardFaceElementPerCardFace available when the editor opens
  public cardFaceElementAttributesChange(cardFaceElementPerCardFace: CardFaceElementPerCardFace, cardFaceElementAttributes$$: Subscription | null, destroyRef: DestroyRef): Subscription {
    unsubscription(cardFaceElementAttributes$$);
    return this.onCardFaceElementAttributes(cardFaceElementPerCardFace, destroyRef);
  }
}
