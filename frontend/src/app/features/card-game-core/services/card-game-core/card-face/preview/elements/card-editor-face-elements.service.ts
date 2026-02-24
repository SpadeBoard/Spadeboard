import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { Coordinates, Dimensions, logInfo, stringify, unsubscription } from '../../../../../../../utils/utils';
import { CardFaceElementImageService } from '../../../../../card-face-element/components/subtypes/image/service/card-face-element-image.service';
import { CardFaceElementRtService } from '../../../../../card-face-element/components/subtypes/rich-text/service/card-face-element-rt.service';
import { CardFaceElementImage, CardFaceElementPerCardFace } from '../../../../../card-face-element/models/card-face-element';
import { CardFaceElementService } from '../../../../../card-face-element/services/core/card-face-element.service';
import { CardEditorControlsDesignElementAttributesService } from '../../../card-editor/controls/design/card-face-elements/attributes/card-editor-controls-design-element-attributes.service';

@Injectable({
  providedIn: 'root',
})
// TODO: Remove this service?
export class CardEditorFaceElementsService {
  public $currentCardFaceElementId: WritableSignal<string> = signal<string>('');

  public $currentCardFaceElementsPerCardFace: WritableSignal<CardFaceElementPerCardFace[]> = signal<CardFaceElementPerCardFace[]>([]);

  public $currentCardFaceElementIdentifiers: WritableSignal<{
    cardFaceElementId: string,
    cardFaceElementType: 'Rt' | 'Image',
    cardFaceElementZIndex: string,
    cardFaceElementPerCardFaceId: string
  }[]> = signal<{
    cardFaceElementId: string,
    cardFaceElementType: 'Rt' | 'Image',
    cardFaceElementZIndex: string,
    cardFaceElementPerCardFaceId: string
  }[]>([]);

  public $currentCardFaceElementRts: WritableSignal<Map<string, string>> = signal<Map<string, string>>(new Map<string, string>());

  public $currentCardFaceElementImages: WritableSignal<Map<string, string>> = signal<Map<string, string>>(new Map<string, string>());

  public $currentCardFaceElementPositions: WritableSignal<Map<string, Coordinates>> = signal<Map<string, Coordinates>>(new Map<string, Coordinates>());

  public $currentCardFaceElementDimensions: WritableSignal<Map<string, Dimensions>> = signal<Map<string, Dimensions>>(new Map<string, Dimensions>());

  private getAllImageSrcs$$: Subscription | null = null;

  private readonly cardFaceElementService: CardFaceElementService = inject<CardFaceElementService>(CardFaceElementService);

  private readonly cardFaceElementRtService: CardFaceElementRtService = inject<CardFaceElementRtService>(CardFaceElementRtService);

  private readonly cardFaceElementImageService: CardFaceElementImageService = inject<CardFaceElementImageService>(CardFaceElementImageService);


  /**************** TODO: Potentially move somewhere else?********************/
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject<CardEditorControlsDesignElementAttributesService>(CardEditorControlsDesignElementAttributesService);
  /***********************************************************/

  //************ MAKE A BIG FUNCTION WITH SWITCH STATEMENTS AND PASS IN THE MAPS AS PARAMETERS**************/
  public setCardFaceElementIdentifiers(
    $currentCardFaceElementIdentifiers: WritableSignal<{
      cardFaceElementId: string;
      cardFaceElementType: "Rt" | "Image";
      cardFaceElementZIndex: string;
      cardFaceElementPerCardFaceId: string;
    }[]>,
    identifiers: {
      cardFaceElementId: string,
      cardFaceElementType: 'Rt' | 'Image',
      cardFaceElementZIndex: string,
      cardFaceElementPerCardFaceId: string // TODO: Take this out
    }
  ): void {
    $currentCardFaceElementIdentifiers.update((currentCardFaceElementIdentifiers: {
      cardFaceElementId: string,
      cardFaceElementType: 'Rt' | 'Image',
      cardFaceElementZIndex: string,
      cardFaceElementPerCardFaceId: string // TODO: Take this out
    }[]) => [...currentCardFaceElementIdentifiers, identifiers]);
  }

  public setCardFaceElementRt($currentCardFaceElementRts: WritableSignal<Map<string, string>>, cardFaceElementId: string, text: string): void {
    $currentCardFaceElementRts.update((currentCardFaceElementRts: Map<string, string>) => new Map<string, string>(currentCardFaceElementRts).set(cardFaceElementId, text));
  }

  public setCardFaceElementImage($currentCardFaceElementImages: WritableSignal<Map<string, string>>, cardFaceElementId: string, url: string): void {
    $currentCardFaceElementImages.update((currentCardFaceElementImages: Map<string, string>) => new Map<string, string>(currentCardFaceElementImages).set(cardFaceElementId, url));
  }

  // TODO: Returns an observable instead and passes back the getAllImageSrc$$ subscription to then be reassigned
  public setCardFaceElementsPerCardFaceAttributes(): void {
    this.setCardFaceElementPerCardFaceIdentifiers(
      this.$currentCardFaceElementsPerCardFace,
      this.$currentCardFaceElementIdentifiers
    );

    this.setCardFaceElementPerCardFaceDimensions(
      this.$currentCardFaceElementsPerCardFace,
      this.$currentCardFaceElementDimensions
    );

    this.setCardFaceElementPerCardFacePositions(
      this.$currentCardFaceElementsPerCardFace,
      this.$currentCardFaceElementPositions
    );

    this.setCardFaceElementPerCardFaceRts(
      this.$currentCardFaceElementsPerCardFace,
      this.$currentCardFaceElementRts
    );
  }

  // CHECKME: Make sure we only need to call this inside of setCardFaceElementsPerCardFaceAttributes and nowhere else
  public setCardFaceElementPerCardFaceIdentifiers(
    $currentCardFaceElementsPerCardFace: WritableSignal<CardFaceElementPerCardFace[]>,
    $currentCardFaceElementIdentifiers: WritableSignal<{
      cardFaceElementId: string;
      cardFaceElementType: "Rt" | "Image";
      cardFaceElementZIndex: string;
      cardFaceElementPerCardFaceId: string;
    }[]>,
  ): void {
    let currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = $currentCardFaceElementsPerCardFace();

    if (!currentCardFaceElementsPerCardFace) {
      $currentCardFaceElementIdentifiers.set([]);
      return;
    }

    $currentCardFaceElementIdentifiers.set(currentCardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) => {
      return {
        cardFaceElementId: value.cardFaceElement.cardFaceElementId,
        cardFaceElementType: value.cardFaceElement.cardFaceElementType,
        cardFaceElementZIndex: value.cardFaceElement.style?.zIndex ?? 'inherit',
        cardFaceElementPerCardFaceId: value.cardFaceElementPerCardFaceId
      }
    }));

    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceElementPerCardFaceIdentifiers.name)}: currentCardFaceElementsPerCardFaceIdentifiers:\n${(stringify(Array.from($currentCardFaceElementIdentifiers().entries())))}`, 'color: #86A397; background: #E5BE9E; padding: 5px; border-radius: 5px;');
  }

  public setCardFaceElementZIndexes(): void {
    let cardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = [...this.$currentCardFaceElementsPerCardFace()];

    this.$currentCardFaceElementIdentifiers.update((identifiers: {
      cardFaceElementId: string;
      cardFaceElementType: "Rt" | "Image";
      cardFaceElementZIndex: string;
      cardFaceElementPerCardFaceId: string;
    }[]) => {
      return identifiers.map((identifier: {
        cardFaceElementId: string;
        cardFaceElementType: "Rt" | "Image";
        cardFaceElementZIndex: string;
        cardFaceElementPerCardFaceId: string;
      }) => {
        let zIndex: string = this.getCardFaceElementPerCardFace(identifier.cardFaceElementId, cardFaceElementsPerCardFace).cardFaceElement.style?.zIndex ?? 'inherit';
        return { ...identifier, cardFaceElementZIndex: zIndex };
      })
    });

    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceElementZIndexes.name)}: currentCardFaceElementsPerCardFaceIdentifiers:\n${(stringify(Array.from(this.$currentCardFaceElementIdentifiers().entries())))}`, 'color: #5400c2; background: #a17174; padding: 5px; border-radius: 5px;');
  }

  public setCardFaceElementPerCardFaceDimensions(
    $currentCardFaceElementsPerCardFace: WritableSignal<CardFaceElementPerCardFace[]>,
    $currentCardFaceElementDimensions: WritableSignal<Map<string, Dimensions>>
  ): void {
    let currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = $currentCardFaceElementsPerCardFace();

    $currentCardFaceElementDimensions.update(($currentCardFaceElementDimensions: Map<string, Dimensions>) => {
      let updated: Map<string, Dimensions> = new Map<string, Dimensions>();

      if (!currentCardFaceElementsPerCardFace) return updated;

      currentCardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) => {
        updated.set(value.cardFaceElement.cardFaceElementId, this.cardFaceElementService.getCardFaceElementDimensions(value.cardFaceElement));
      });

      return updated;
    });

    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceElementPerCardFaceDimensions.name)} - currentCardFaceElementsPerCardFaceDimensions: ${stringify($currentCardFaceElementDimensions())}`, `color: #253C78; background: #FFEECF; padding: 5px; border-radius: 5px;`);
  }

  public setCardFaceElementPerCardFacePositions(
    $currentCardFaceElementsPerCardFace: WritableSignal<CardFaceElementPerCardFace[]>,
    $currentCardFaceElementPositions: WritableSignal<Map<string, Coordinates>>
  ): void {
    let currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = $currentCardFaceElementsPerCardFace();

    $currentCardFaceElementPositions.update(($currentCardFaceElementPositions: Map<string, Coordinates>) => {
      let updated: Map<string, Coordinates> = new Map<string, Coordinates>();

      if (!currentCardFaceElementsPerCardFace) return updated;

      currentCardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) => {
        updated.set(value.cardFaceElement.cardFaceElementId, {
          x: value.dndPosition.x,
          y: value.dndPosition.y
        });
      });

      return updated;
    });

    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceElementPerCardFacePositions.name)} - currentCardFaceElementsPerCardFacePositions: ${stringify($currentCardFaceElementPositions())}`, `color: #0471A6; background: #89AAE6; padding: 5px; border-radius: 5px;`);
  }

  public setCardFaceElementPerCardFaceRts(
    $currentCardFaceElementsPerCardFace: WritableSignal<CardFaceElementPerCardFace[]>,
    $currentCardFaceElementRts: WritableSignal<Map<string, string>>
  ): void {
    let currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = $currentCardFaceElementsPerCardFace();

    // TODO: Refactor this to make it slightly faster
    $currentCardFaceElementRts.update(($currentCardFaceElementRts: Map<string, string>) => {
      let updated: Map<string, string> = new Map<string, string>();

      if (!currentCardFaceElementsPerCardFace) return updated;

      currentCardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) => {
        if (this.cardFaceElementRtService.isRt(value.cardFaceElement.cardFaceElementId, $currentCardFaceElementsPerCardFace()))
          updated.set(value.cardFaceElement.cardFaceElementId, this.cardFaceElementRtService.getRt(value.cardFaceElement.cardFaceElementId, currentCardFaceElementsPerCardFace));
      });

      return updated;
    });

    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceElementPerCardFaceRts.name)} - currentCardFaceElementsPerCardFaceRts: ${stringify($currentCardFaceElementRts())}`, `color: #48435C; background: #61E786; padding: 5px; border-radius: 5px;`);
  }

  public setCardFaceElementPerCardFaceImages(destroyRef: DestroyRef): void {
    unsubscription(this.getAllImageSrcs$$);
    this.getAllImageSrcs$$ = this.setCardFaceElementPerCardFaceImages$(
      this.$currentCardFaceElementsPerCardFace,
      destroyRef
    )
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((results: {
        cardFaceElementId: string;
        htmlImageElementSrc: string;
      }[]) => {
        this.$currentCardFaceElementImages.set(this.setCardFaceElementImages(results));
      }
      );
  }

  public setCardFaceElementPerCardFaceImage(cardFaceElementImage: CardFaceElementImage, idx: number): void {
    this.$currentCardFaceElementsPerCardFace.update(($currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]) => (
      $currentCardFaceElementsPerCardFace.map((cardFaceElementPerCardFace: CardFaceElementPerCardFace, index: number) => {
        return (index === idx) ? { ...cardFaceElementPerCardFace, cardFaceElement: cardFaceElementImage } : cardFaceElementPerCardFace
      })
    ));
  }

  // SPLIT TO RETURN getAllImageSrcs$
  public setCardFaceElementPerCardFaceImages$$(
    $currentCardFaceElementsPerCardFace: WritableSignal<CardFaceElementPerCardFace[]>,
    $currentCardFaceElementImages: WritableSignal<Map<string, string>>,
    destroyRef: DestroyRef
  ): Subscription {
    let cardFaceElementImagesPerCardFace: CardFaceElementPerCardFace[] = $currentCardFaceElementsPerCardFace().filter((value: CardFaceElementPerCardFace) => (this.cardFaceElementImageService.isImage(value.cardFaceElement.cardFaceElementId, $currentCardFaceElementsPerCardFace())));

    return this.cardFaceElementImageService.getAllImageSrcs$(cardFaceElementImagesPerCardFace, destroyRef)
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((results: {
        cardFaceElementId: string;
        htmlImageElementSrc: string;
      }[]) => {
        $currentCardFaceElementImages.set(this.setCardFaceElementImages(results));
      }
      );
  }

  public setCardFaceElementPerCardFaceImages$(
    $currentCardFaceElementsPerCardFace: WritableSignal<CardFaceElementPerCardFace[]>,
    destroyRef: DestroyRef
  ): Observable<{
    cardFaceElementId: string;
    htmlImageElementSrc: string;
  }[]> {
    let cardFaceElementImagesPerCardFace: CardFaceElementPerCardFace[] = $currentCardFaceElementsPerCardFace().filter((value: CardFaceElementPerCardFace) => (this.cardFaceElementImageService.isImage(value.cardFaceElement.cardFaceElementId, $currentCardFaceElementsPerCardFace())));

    return this.cardFaceElementImageService.getAllImageSrcs$(cardFaceElementImagesPerCardFace, destroyRef);
  }

  public setCardFaceElementImages(results: {
    cardFaceElementId: string;
    htmlImageElementSrc: string;
  }[]): Map<string, string> {
    let updated: Map<string, string> = new Map<string, string>();

    if (results) {
      results.forEach((result: {
        cardFaceElementId: string;
        htmlImageElementSrc: string;
      }) => {
        let { cardFaceElementId, htmlImageElementSrc } = result;
        updated.set(cardFaceElementId, htmlImageElementSrc);
      });
    }

    return updated;
  }

  // TODO: Make a function specifically to set the maps in here?
  public setCardFaceElementPosition($currentCardFaceElementPositions: WritableSignal<Map<string, Coordinates>>, cardFaceElementId: string, pos: Coordinates): void {
    $currentCardFaceElementPositions.update(($currentCardFaceElementPositions: Map<string, Coordinates>) => new Map<string, Coordinates>($currentCardFaceElementPositions).set(cardFaceElementId, pos));
  }

  public setCardFaceElementDimensions($currentCardFaceElementDimensions: WritableSignal<Map<string, Dimensions>>, cardFaceElementId: string, dimensions: Dimensions) {
    $currentCardFaceElementDimensions.update(($currentCardFaceElementDimensions: Map<string, Dimensions>) => new Map<string, Dimensions>($currentCardFaceElementDimensions).set(cardFaceElementId, dimensions));
  }

  /****************** EDITORS ***********************/

  /************ SHOULD PROBABLY SPLIT THESE INTO TWO DIFFERENT SERVICES*************** */
  public getCardFaceElementPerCardFace(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): CardFaceElementPerCardFace {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.cardFaceElementService.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace);
    if (!cardFaceElementPerCardFace) throw new Error("Card editor face preview: There is no current card face element per card face to set attributes");
    return cardFaceElementPerCardFace;
  }

  public setCurrentCardFaceElementId(cardFaceElementId: string, shouldSetAttribute?: boolean): string {
    this.$currentCardFaceElementId.set(cardFaceElementId);
    if (shouldSetAttribute) this.cardEditorControlsDesignElementAttributesService.$currentCardFaceElementId.set(cardFaceElementId);
    return cardFaceElementId;
  }

  public setElementAttributes(
    cardFaceElementId: string
  ): void {
    this.setCurrentCardFaceElementId(cardFaceElementId, true);

    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = this.getCardFaceElementPerCardFace(cardFaceElementId, this.$currentCardFaceElementsPerCardFace());

    console.log(`%c${logInfo(this.constructor.name, this.setElementAttributes.name)}: cardFaceElementId: ${stringify(cardFaceElementId)}\ncardFaceElementPerCardFace:\n${stringify(cardFaceElementPerCardFace)}`, 'color: #12355B; background: #FFFFFF; padding: 5px; border-radius: 5px;');
  }
}