import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, map, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { clamp, clear, Coordinates, Dimensions, logInfo, operate, parseNumeric, stringify } from '../../../../../utils/utils';
import { DndPosition } from '../../../../drag-and-drop/models/dnd-types';
import { Style } from '../../../../style/models/style';
import { CardFaceElementPerCardFace } from '../../../models/card-face-element';
import { MAX_CURRENT_ELEMENTS_PER_CARD_FACE } from '../../../utils/card-editor.constants';
import { createCardFaceElementPerCardFace } from '../../../utils/card-face-element.constants';
import { CardFaceElementApiService } from './api/card-face-element-api.service';
import { CardFaceElementDndService } from './dnd/card-face-element-dnd.service';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementService {
  private readonly cardFaceElementApiService: CardFaceElementApiService = inject(CardFaceElementApiService);

  private readonly cardFaceElementDndService: CardFaceElementDndService = inject(CardFaceElementDndService);

  private createdCardFaceElementPerCardFace$$: Subject<{ type: string, dndPosition: DndPosition }> = new Subject<{ type: string, dndPosition: DndPosition }>();
  public readonly createdCardFaceElementPerCardFace$: Observable<{ type: string, dndPosition: DndPosition }> = this.createdCardFaceElementPerCardFace$$.asObservable();

  private deletedCardFaceElementPerCardFace$$: Subject<string> = new Subject<string>();
  public readonly deletedCardFaceElementPerCardFace$: Observable<string> = this.deletedCardFaceElementPerCardFace$$.asObservable();

  public cardFaceElementsPerCardFaceToDeleteIds: string[] = [];

  constructor() { }

  public getCardFaceElementPerCardFace(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], type?: string): CardFaceElementPerCardFace | undefined {
    return (type) ? cardFaceElementsPerCardFace.find(cfe => cfe.cardFaceElement.cardFaceElementId === cardFaceElementId && cfe.cardFaceElement.cardFaceElementType === type) : cardFaceElementsPerCardFace.find(cfe => cfe.cardFaceElement.cardFaceElementId === cardFaceElementId);
  }

  public getCardFaceElementPosition(cardFaceElementPerCardFace: CardFaceElementPerCardFace): Coordinates;
  public getCardFaceElementPosition(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): Coordinates;
  public getCardFaceElementPosition(cardFaceElement: string | CardFaceElementPerCardFace, cardFaceElementsPerCardFace?: CardFaceElementPerCardFace[]): Coordinates {
    let current: CardFaceElementPerCardFace | undefined = (typeof cardFaceElement === "string" && cardFaceElementsPerCardFace) ? this.getCardFaceElementPerCardFace(cardFaceElement, cardFaceElementsPerCardFace) : cardFaceElement as CardFaceElementPerCardFace;

    if (!current)
      throw new Error("No card face element per card face");

    let { dndPosition } = current;

    return {
      x: dndPosition.x,
      y: dndPosition.y
    }
  }

  public setCardFaceElementPosition(coordinates: Coordinates, cardFaceElementPerCardFace: CardFaceElementPerCardFace): void;
  public setCardFaceElementPosition(coordinates: Coordinates, cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void;
  public setCardFaceElementPosition(coordinates: Coordinates, cardFaceElement: string | CardFaceElementPerCardFace, cardFaceElementsPerCardFace?: CardFaceElementPerCardFace[]): void {
    let current: CardFaceElementPerCardFace | undefined = (typeof cardFaceElement === "string" && cardFaceElementsPerCardFace) ? this.getCardFaceElementPerCardFace(cardFaceElement, cardFaceElementsPerCardFace) : cardFaceElement as CardFaceElementPerCardFace;

    if (!current) throw new Error("No card face element per card face");

    current.dndPosition.x = coordinates.x;
    current.dndPosition.y = coordinates.y;
  }

  public getCardFaceElementDimensions(cardFaceElementPerCardFace: CardFaceElementPerCardFace): Dimensions;
  public getCardFaceElementDimensions(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): Dimensions;
  public getCardFaceElementDimensions(cardFaceElement: string | CardFaceElementPerCardFace, cardFaceElementsPerCardFace?: CardFaceElementPerCardFace[]): Dimensions {
    let current: CardFaceElementPerCardFace | undefined = (typeof cardFaceElement === "string" && cardFaceElementsPerCardFace) ? this.getCardFaceElementPerCardFace(cardFaceElement, cardFaceElementsPerCardFace) : cardFaceElement as CardFaceElementPerCardFace;

    if (!current)
      throw new Error("No card face element per card face");

    let style: Style | undefined = current.cardFaceElement.style;

    if (!style) throw new Error("No card face element style");

    let { width, height } = style;

    if (!width || !height) throw new Error("No width or height associated with this style");

    let dimensions: Dimensions = {
      width: parseNumeric(width),
      height: parseNumeric(height)
    };

    return dimensions;
  }

  public setCardFaceElementDimensions(dimensions: Dimensions, cardFaceElementPerCardFace: CardFaceElementPerCardFace): void;
  public setCardFaceElementDimensions(dimensions: Dimensions, cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void;
  public setCardFaceElementDimensions(dimensions: Dimensions, cardFaceElement: string | CardFaceElementPerCardFace, cardFaceElementsPerCardFace?: CardFaceElementPerCardFace[]): void {
    let current: CardFaceElementPerCardFace | undefined = (typeof cardFaceElement === "string" && cardFaceElementsPerCardFace) ? this.getCardFaceElementPerCardFace(cardFaceElement, cardFaceElementsPerCardFace) : cardFaceElement as CardFaceElementPerCardFace;

    if (!current) throw new Error("No card face element per card face");

    if (!current)
      throw new Error("No card face element per card face");

    let style: Style | undefined = current.cardFaceElement.style;

    if (!style) throw new Error("No card face element style");

    style.width = `${dimensions.width}px`;
    style.height =`${dimensions.height}px`;
  }


  /************* TODO: MOVE THESE INTO OWN SERVICE? ********************/
  // TODO: Make this private
  public bringToFront(cardFaceElement: string | CardFaceElementPerCardFace, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    if (!cardFaceElementsPerCardFace) throw new Error("No card face elements per card face to grab max index");

    let maxZIndex: number = Math.max(
      ...cardFaceElementsPerCardFace.map(
        e => parseInt(e.cardFaceElement.style?.zIndex ?? "1") || 0
      )
    );

    let current: CardFaceElementPerCardFace | undefined = (typeof cardFaceElement === "string") ? this.getCardFaceElementPerCardFace(cardFaceElement, cardFaceElementsPerCardFace) : cardFaceElement as CardFaceElementPerCardFace;

    if (!current) return;

    if (!current.cardFaceElement.style)
      throw new Error("Card face element has no style to add Z index to");

    current.cardFaceElement.style.zIndex = `${clamp(maxZIndex + 1, 0, cardFaceElementsPerCardFace.length)}`;
  }

  // TODO: Make this private
  public sendToBack(cardFaceElement: string | CardFaceElementPerCardFace, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    if (!cardFaceElementsPerCardFace) throw new Error("No card face elements per card face to grab max index");

    let minZIndex: number = Math.min(
      ...cardFaceElementsPerCardFace.map(
        e => parseInt(e.cardFaceElement.style?.zIndex ?? "1") || 0
      )
    );

    let current: CardFaceElementPerCardFace | undefined = (typeof cardFaceElement === "string") ? this.getCardFaceElementPerCardFace(cardFaceElement, cardFaceElementsPerCardFace) : cardFaceElement as CardFaceElementPerCardFace;

    if (!current) return;

    if (!current.cardFaceElement.style)
      throw new Error("Card face element has no style to add Z index to");

    current.cardFaceElement.style.zIndex = `${clamp(minZIndex - 1, 0, cardFaceElementsPerCardFace.length)}`;
  }

  public setLayer(cardFaceElementPerCardFace: CardFaceElementPerCardFace, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], operation: 'front' | 'back'): void;
  public setLayer(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], operation: 'front' | 'back'): void;
  public setLayer(cardFaceElement: string | CardFaceElementPerCardFace, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], operation: 'front' | 'back'): void {
    switch (operation) {
      case ('front'): {
        this.bringToFront(cardFaceElement, cardFaceElementsPerCardFace);
        break;
      }
      case ('back'): {
        this.sendToBack(cardFaceElement, cardFaceElementsPerCardFace);
        break;
      }
      default:
        throw new Error("Unsupported layering operation");
    }
  }

  /************* TODO: MOVE THESE INTO OWN SERVICE? ********************/

  /*************************** TODO: MOVE INTO OWN SERVICE? *****************************/
  // TODO: Modify this to have it be overloaded
  public isInCardFaceElementsPerCardFace(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): boolean {
    return cardFaceElementsPerCardFace.findIndex((c: CardFaceElementPerCardFace) => c.cardFaceElement.cardFaceElementId === cardFaceElementId) !== -1;
  }

  public createdCardFaceElementPerCardFace(type: string, dndPosition: DndPosition): void {
    this.createdCardFaceElementPerCardFace$$.next({ type, dndPosition });
  }

  public deletedCardFaceElementPerCardFace(cardFaceElementPerCardFaceId: string): void {
    this.deletedCardFaceElementPerCardFace$$.next(cardFaceElementPerCardFaceId);
  }

  // CHECKME: Do we need to move to another service as it's possible to have operations specifically for just card face element, not card face element per card face
  public onOperations(cardFaceElementsPerCardFaceOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.createdCardFaceElementPerCardFace$.pipe(
        map((emitted: { type: string, dndPosition: DndPosition }) => ({ operation: 'create', emitted }))
      ),
      this.deletedCardFaceElementPerCardFace$.pipe(
        map((id: string) => ({operation: 'delete', emitted: id}))
      ),
    )
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((key: string | { operation: string, emitted: { type: string, dndPosition: DndPosition } | string}) => {
        operate(key, cardFaceElementsPerCardFaceOperations);
      });
  }

  public canAddCardFaceElementPerCardFace(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): boolean {
    return cardFaceElementsPerCardFace.length < MAX_CURRENT_ELEMENTS_PER_CARD_FACE;
  }

  public createCardFaceElementPerCardFace(
    relative: {
      absolute: Coordinates,
      rect: DOMRect
    },
    type: string,
    cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): string {
    if (!this.canAddCardFaceElementPerCardFace(cardFaceElementsPerCardFace)) {
      console.error(`On create card face element per card face - Too many card face element per card face`);
      return '';
    }

    let { absolute, rect } = relative;

    let dndPosition: Coordinates = this.cardFaceElementDndService.getRelativeCoordinates(absolute, rect);

    let currentCardFaceElementPerCardFaceId: string = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // FIXED: Elements can share the same ID, so you can accidentally select double
    // So we'll just do Date.now which should return a large number and it should still be fine because it is parseable in the backend
    cardFaceElementsPerCardFace.push(
      createCardFaceElementPerCardFace(currentCardFaceElementPerCardFaceId, type, dndPosition)
    );

    return currentCardFaceElementPerCardFaceId;
  }

  // TODO: Refactor this, rewrite it, it should be more obust than this
  public doesCardFaceElementPerCardFaceToDeleteExistInDatabase(cardFaceElementPerCardFaceId: string): boolean {
    return /^\d{17,20}$/.test(cardFaceElementPerCardFaceId);
  }

  public deleteCardFaceElementPerFace(id: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): CardFaceElementPerCardFace[] {
    return cardFaceElementsPerCardFace.filter((c: CardFaceElementPerCardFace) => c.cardFaceElementPerCardFaceId !== id);
  }

  public deleteCardFaceElementsPerCardFace$(cardFaceElementsPerCardFaceIds: string[]): Observable<any[]> {
    console.log(`%c${logInfo(this.constructor.name, this.deleteCardFaceElementsPerCardFace$.name)} (before): ${stringify(cardFaceElementsPerCardFaceIds)}`, `color: #4E56C0; background: #FDCFFA; padding: 5px; border-radius: 5px;`);
    if (cardFaceElementsPerCardFaceIds.length <= 0) {
      return of([]);
    }

    let deleteObservables: Observable<void>[] = [];
    while (cardFaceElementsPerCardFaceIds.length > 0) {
      let id: string | undefined = cardFaceElementsPerCardFaceIds.pop();
      if (id !== undefined) {
        deleteObservables.push(this.cardFaceElementApiService.deleteCardFaceElementPerCardFace$(id));
      }
    }

    // Return a single observable that completes when all deletes are done
    return forkJoin(deleteObservables);
  }

  public clear(): void {
    console.log(`%c${logInfo(this.constructor.name, this.clear.name)}(before):\n${stringify(this.cardFaceElementsPerCardFaceToDeleteIds)}`, 'color: #493323; background: #FFDF91; padding: 5px; border-radius: 5px;');

    clear(this.cardFaceElementsPerCardFaceToDeleteIds);

    console.assert(this.cardFaceElementsPerCardFaceToDeleteIds.length === 0, `${logInfo(this.constructor.name, this.clear.name)}: cardFaceElementsPerCardFaceToDeleteIds isn't cleared`);
    console.log(`%c${logInfo(this.constructor.name, this.clear.name)} (after):\n${stringify(this.cardFaceElementsPerCardFaceToDeleteIds)}`, 'color: #280B45; background: #FFE98A; padding: 5px; border-radius: 5px;');
  }
}