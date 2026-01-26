import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Observable, Subscription } from 'rxjs';
import { FileMetadata } from '../../../../../../../utils/models/file-metadata';
import { Coordinates, Dimensions, logInfo, stringify, unsubscription } from '../../../../../../../utils/utils';
import { CardFaceElementImage, CardFaceElementPerCardFace } from '../../../../../models/card-face-element';
import { DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID } from '../../../../../utils/card-editor.constants';
import { CardEditorControlsDesignElementAttributesService } from '../../../card-editor/controls/design/card-face-elements/attributes/card-editor-controls-design-element-attributes.service';
import { CardEditorControlsElementLayeringAttributesService } from '../../../card-editor/controls/design/card-face-elements/attributes/card-editor-controls-element-layering-attributes.service';
import { CardEditorControlsDesignImageService } from '../../../card-editor/controls/design/card-face-elements/card-editor-controls-design-image.service';
import { CardEditorControlsDesignRteService } from '../../../card-editor/controls/design/card-face-elements/card-editor-controls-design-rte.service';
import { CardFaceElementService } from '../../../card-face-element/card-face-element.service';
import { CardFaceElementImageService } from '../../../card-face-element/images/card-face-element-image.service';
import { CardFaceElementRtService } from '../../../card-face-element/rt/card-face-element-rt.service';

@Injectable({
  providedIn: 'root',
})
// TODO: Potentially split this?
export class CardFaceEditorPreviewElementsService {
  // TODO: Make the maps in here insted and make it a signal
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

  private cardFaceElementAttributes$$: Subscription | null = null;

  private cardFaceElementLayering$$: Subscription | null = null;

  private cardFaceElementsPerCardFaceOperations$$: Subscription | null = null;

  private getAllImageSrcs$$: Subscription | null = null;

  private readonly cardFaceElementService: CardFaceElementService = inject(CardFaceElementService);

  private readonly cardFaceElementRtService: CardFaceElementRtService = inject(CardFaceElementRtService);

  private readonly cardEditorControlsDesignRteService: CardEditorControlsDesignRteService = inject(CardEditorControlsDesignRteService);

  private readonly cardFaceElementImageService: CardFaceElementImageService = inject(CardFaceElementImageService);

  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);

  /**************** TODO: Potentially move somewhere else?********************/
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  private readonly cardEditorControlsElementLayeringAttributesService: CardEditorControlsElementLayeringAttributesService = inject(CardEditorControlsElementLayeringAttributesService);
  /***********************************************************/

  public setCardFaceElementsPerCardFace(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], destroyRef: DestroyRef): void {
    this.$currentCardFaceElementsPerCardFace.set([...cardFaceElementsPerCardFace]);

    // TODO: Refactor this eventually
    this.setCardFaceElementsPerCardFaceAttributes();

    this.setCardFaceElementPerCardFaceImages(destroyRef);

    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceElementsPerCardFace.name)}:\ncardFaceElementsPerCardFace:\n${stringify(this.$currentCardFaceElementsPerCardFace())}`, `color: #504B38; background: #F8F3D9; padding: 5px; border-radius: 5px;`);
  }

  public configureCardFaceElements(
    cardFaceElementsPerCardFaceOperations: Map<string, Function>,
    cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], 
    destroyRef: DestroyRef): void {
    this.setCardFaceElementsPerCardFace(cardFaceElementsPerCardFace, destroyRef);

    this.resetElementAttributes();

    this.setCardFaceElementsPerCardFaceOperations$$(cardFaceElementsPerCardFaceOperations, destroyRef);
  }

  public setCardFaceElementsPerCardFaceOperations$$(cardFaceElementsPerCardFaceOperations: Map<string, Function>,destroyRef: DestroyRef): void {
    this.cardFaceElementsPerCardFaceOperations$$ = this.cardFaceElementService.cardFaceElementsPerCardFaceOperationsChange(cardFaceElementsPerCardFaceOperations, this.cardFaceElementsPerCardFaceOperations$$, destroyRef);
  }

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
    $currentCardFaceElementIdentifiers.update(($currentCardFaceElementIdentifiers: {
      cardFaceElementId: string,
      cardFaceElementType: 'Rt' | 'Image',
      cardFaceElementZIndex: string,
      cardFaceElementPerCardFaceId: string // TODO: Take this out
    }[]) => [...$currentCardFaceElementIdentifiers, identifiers]);
  }

  public setCardFaceElementRt($currentCardFaceElementRts: WritableSignal<Map<string, string>>, cardFaceElementId: string, text: string): void {
    $currentCardFaceElementRts.update(($currentCardFaceElementRts: Map<string, string>) => new Map<string, string>($currentCardFaceElementRts).set(cardFaceElementId, text));
  }

  public setCardFaceElementImage($currentCardFaceElementImages: WritableSignal<Map<string, string>>, cardFaceElementId: string, url: string): void {
    $currentCardFaceElementImages.update(($currentCardFaceElementImages: Map<string, string>) => new Map<string, string>($currentCardFaceElementImages).set(cardFaceElementId, url));
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
        if (this.cardFaceElementRtService.isRt(value.cardFaceElement.cardFaceElementId, $currentCardFaceElementsPerCardFace(), this.cardFaceElementService))
          updated.set(value.cardFaceElement.cardFaceElementId, this.cardFaceElementRtService.getRt(value.cardFaceElement.cardFaceElementId, currentCardFaceElementsPerCardFace, this.cardFaceElementService));
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
    let cardFaceElementImagesPerCardFace: CardFaceElementPerCardFace[] = $currentCardFaceElementsPerCardFace().filter((value: CardFaceElementPerCardFace) => (this.cardFaceElementImageService.isImage(value.cardFaceElement.cardFaceElementId, $currentCardFaceElementsPerCardFace(), this.cardFaceElementService)));

    return this.cardFaceElementImageService.getAllImageSrcs$(cardFaceElementImagesPerCardFace, this.cardFaceElementService, destroyRef)
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
    let cardFaceElementImagesPerCardFace: CardFaceElementPerCardFace[] = $currentCardFaceElementsPerCardFace().filter((value: CardFaceElementPerCardFace) => (this.cardFaceElementImageService.isImage(value.cardFaceElement.cardFaceElementId, $currentCardFaceElementsPerCardFace(), this.cardFaceElementService)));

    return this.cardFaceElementImageService.getAllImageSrcs$(cardFaceElementImagesPerCardFace, this.cardFaceElementService, destroyRef);
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
  public enableElement(cardFaceElementId: string, type: string, destroyRef: DestroyRef): void {
    switch (type) {
      case 'Rt':
        this.enableRte(cardFaceElementId, destroyRef);
        break;
      case 'Image':
        this.focusImage(cardFaceElementId, destroyRef);
        break;
      default:
         this.setElementAttributes(cardFaceElementId, destroyRef);
    }
  }

  public enableRte(
    rtCardFaceElementId: string,
    destroyRef: DestroyRef
  ): void {
    this.disableImageEditor();

    this.setElementAttributes(rtCardFaceElementId, destroyRef);

    this.setCardFaceElementRt(this.$currentCardFaceElementRts, rtCardFaceElementId, this.cardFaceElementRtService.getRt(rtCardFaceElementId, this.$currentCardFaceElementsPerCardFace(), this.cardFaceElementService));
    this.cardEditorControlsDesignRteService.setOnEnableRte(rtCardFaceElementId, this.cardFaceElementRtService.getRt(rtCardFaceElementId, this.$currentCardFaceElementsPerCardFace(), this.cardFaceElementService));
  }

  public disableRte(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    if (!this.cardFaceElementRtService.isRt(cardFaceElementId, cardFaceElementsPerCardFace, this.cardFaceElementService)) return;

    this.cardEditorControlsDesignRteService.setOnDisableRte(cardFaceElementId, this.cardFaceElementRtService.getRt(cardFaceElementId, cardFaceElementsPerCardFace, this.cardFaceElementService));
  }

  public imageEditorStatusToggle(imageEditorStatusOperations: Map<string, Function>, destroyRef: DestroyRef): void {
    this.cardEditorControlsDesignImageService.onStatusToggle(imageEditorStatusOperations, destroyRef);
  }

  public enableImageEditor(
    imageCardFaceElementId: string,
    destroyRef: DestroyRef
  ): void {
    this.focusImage(
      imageCardFaceElementId,
      destroyRef
    );

    this.cardEditorControlsDesignImageService.displayCardFaceImageEditor();
  }

  public focusImage(
    imageCardFaceElementId: string,
    destroyRef: DestroyRef
  ): void {
    this.disableRte(this.$currentCardFaceElementId(), this.$currentCardFaceElementsPerCardFace());

    this.setElementAttributes(imageCardFaceElementId, destroyRef);
    /*this.setElementAttributes(cardFaceElementId, cardFaceElementAttributes$$, cardFaceElementLayering$$, destroyRef);*/
  }

  public uploadImage(
    src: string,
    setSrc: (src: string) => void
  ): void {
    if (!src || !this.cardFaceElementImageService.isImage(this.$currentCardFaceElementId(), this.$currentCardFaceElementsPerCardFace(), this.cardFaceElementService)) return;

    setSrc(src);
  }

  public setSrc$(src: string, destroyRef: DestroyRef): Observable<CardFaceElementImage> {
    this.setCardFaceElementImage(this.$currentCardFaceElementImages, this.$currentCardFaceElementId(), src);

    let cardFaceElementImage: CardFaceElementImage = this.cardFaceElementImageService.getElement(
      this.$currentCardFaceElementId(),
      this.$currentCardFaceElementsPerCardFace(),
      this.cardFaceElementService
    );

    return this.cardFaceElementImageService.setSrc(src, cardFaceElementImage, destroyRef)
      .pipe(
        map((cardFaceElementImageFileMetadata: FileMetadata | undefined) => {
          if (!cardFaceElementImageFileMetadata) throw new Error(`Set card face image element src:\nCard face element image file metadata: ${stringify(cardFaceElementImageFileMetadata)}\nImage file metadata${stringify(cardFaceElementImage.imageFileMetadata)}`);

          cardFaceElementImage.imageFileMetadata = cardFaceElementImageFileMetadata;
          console.log(`%c${logInfo(this.constructor.name, this.setSrc$.name)}: cardFaceElementImage: ${stringify(cardFaceElementImage)}`, 'color: #202C39; background: #B8B08D; padding: 5px; border-radius: 5px;');

          /*let idx: number = this.$currentCardFaceElementsPerCardFace().findIndex((e: CardFaceElementPerCardFace) => e.cardFaceElement.cardFaceElementId === cardFaceElementImage.cardFaceElementId);

          if (idx) {
            let updated: CardFaceElementPerCardFace[] = [...this.$currentCardFaceElementsPerCardFace()];

            updated[idx] = {
              ...updated[idx],
              cardFaceElement: cardFaceElementImage
            };

            this.setCardFaceElementsPerCardFace(updated, destroyRef);
          }*/

          return cardFaceElementImage;
        }
        )
      )
  }

  public disableImageEditor(): void {
    if (!this.cardFaceElementImageService.isImage(this.$currentCardFaceElementId(), this.$currentCardFaceElementsPerCardFace(), this.cardFaceElementService)) return;

    this.cardEditorControlsDesignImageService.closeCardFaceImageEditor();
  }

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
    cardFaceElementId: string,
    destroyRef: DestroyRef
  ): void {
    this.setCurrentCardFaceElementId(cardFaceElementId, true);

    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = this.getCardFaceElementPerCardFace(cardFaceElementId, this.$currentCardFaceElementsPerCardFace());

    // NOTE: This should refresh the cardFaceElementPerCardFace and allow these to be subscribed properly
    this.cardFaceElementAttributes$$ = this.cardEditorControlsDesignElementAttributesService.cardFaceElementAttributesChange(cardFaceElementPerCardFace, this.cardFaceElementAttributes$$, destroyRef);

    this.cardFaceElementLayering$$ = this.cardEditorControlsElementLayeringAttributesService.cardFaceElementsLayeringChange(
      (operation: string) => {
        if (operation !== 'front' && operation !== 'back') throw new Error('No operation to card face element layer');

        this.cardFaceElementService.setLayer(this.$currentCardFaceElementId(), this.$currentCardFaceElementsPerCardFace(), operation);

        this.setCardFaceElementZIndexes();
      },
      this.cardFaceElementLayering$$,
      destroyRef);

    this.cardEditorControlsDesignElementAttributesService.setElementAttributesPosition(this.cardFaceElementService.getCardFaceElementPosition(cardFaceElementPerCardFace));
    this.cardEditorControlsDesignElementAttributesService.setElementAttributesDimensions(this.cardFaceElementService.getCardFaceElementDimensions(cardFaceElementPerCardFace));

    console.log(`%c${logInfo(this.constructor.name, this.setElementAttributes.name)}: cardFaceElementId: ${stringify(cardFaceElementId)}\ncardFaceElementPerCardFace:\n${stringify(cardFaceElementPerCardFace)}`, 'color: #12355B; background: #FFFFFF; padding: 5px; border-radius: 5px;');
  }

  public resetElementAttributes(): void {
    this.setCurrentCardFaceElementId(DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

    // TODO: Disable RTE
    this.cardEditorControlsDesignElementAttributesService.resetElementAttributes();

    unsubscription(this.cardFaceElementAttributes$$);
    unsubscription(this.cardFaceElementLayering$$);
  }

  public setElementPosition(coordinates: Coordinates): void {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = this.getCardFaceElementPerCardFace(this.$currentCardFaceElementId(), this.$currentCardFaceElementsPerCardFace());

    this.setCardFaceElementPosition(this.$currentCardFaceElementPositions, this.$currentCardFaceElementId(), coordinates);
    this.cardFaceElementService.setCardFaceElementPosition(coordinates, cardFaceElementPerCardFace);
    this.cardEditorControlsDesignElementAttributesService.setElementAttributesPosition(this.cardFaceElementService.getCardFaceElementPosition(cardFaceElementPerCardFace));
  }

  public setElementDimensions(dimensions: Dimensions): void {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = this.getCardFaceElementPerCardFace(this.$currentCardFaceElementId(), this.$currentCardFaceElementsPerCardFace());

    this.setCardFaceElementDimensions(this.$currentCardFaceElementDimensions, this.$currentCardFaceElementId(), dimensions);
    this.cardFaceElementService.setCardFaceElementDimensions(dimensions, cardFaceElementPerCardFace);
    this.cardEditorControlsDesignElementAttributesService.setElementAttributesDimensions(this.cardFaceElementService.getCardFaceElementDimensions(cardFaceElementPerCardFace));
  }

  public rteTextChange(destroyRef: DestroyRef): void {
    this.cardEditorControlsDesignRteService.rteTextChange((text: string) => {
      this.setCardFaceElementRt(this.$currentCardFaceElementRts, this.$currentCardFaceElementId(), text);
      this.cardFaceElementRtService.setRt(this.$currentCardFaceElementId(), text, this.$currentCardFaceElementsPerCardFace(), this.cardFaceElementService);
    }, destroyRef);
  }

  // Potentially have a DestroyRef here and unsubscribe to everything on ngOnDestroy
}