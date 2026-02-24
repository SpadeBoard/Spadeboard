import { ComponentRef, DestroyRef, inject, Injectable } from '@angular/core';
import canvasSize from 'canvas-size';
import { firstValueFrom, forkJoin, Observable, switchMap, tap } from 'rxjs';
import { ActionContextMenuItem } from '../../../../shared/actions/models/action-context-menu-item';
import { FileMetadata, FileMetadataStatus } from '../../../../utils/models/file-metadata';
import { AtlasExportService } from '../../../../utils/services/atlas-export/atlas-export.service';
import { Coordinates, Dimensions, exportCustomTypeFile, logInfo, stringify, unzipImages } from '../../../../utils/utils';
import { CardEditorFaceComponent } from '../../card-editor-face/components/core/card-editor-face.component';
import { CardEditorFaceModalService } from '../../card-editor-face/service/modal/card-editor-face-modal.service';
import { DEFAULT_ATLAS_EXPORT_LOD, getCurrentCardFaceId, getCurrentCardFaceIndex, setCurrentCardFaceId } from '../../card-editor/constants/card-editor.constants';
import { CardEditorCardDto } from '../../card-editor/models/card-editor-card-dto';
import { CardEditorCardFaceDto } from '../../card-editor/models/card-editor-card-face-dto';
import { CardEditorFacadeService } from '../../card-editor/services/facade/card-editor-facade.service';
import { CardEditorModalService } from '../../card-editor/services/modal/card-editor-modal.service';
import { CardEditorOperationsService } from '../../card-editor/services/operations/card-editor-operations.service';
import { CardFaceElementImageService } from '../../card-face-element/components/subtypes/image/service/card-face-element-image.service';
import { CardFaceElementRtService } from '../../card-face-element/components/subtypes/rich-text/service/card-face-element-rt.service';
import { CardFaceElementPerCardFace } from '../../card-face-element/models/card-face-element';
import { CardFaceElementService } from '../../card-face-element/services/core/card-face-element.service';
import { CardFaceLodsService } from '../../card-face-per-lod/services/core/card-face-lods.service';
import { Card } from '../../card/models/card';
import { CardFacePerCardApiService } from '../../services/card-game-core/api/card-face-per-card-api.service';

@Injectable({
  providedIn: 'root',
})
export class CardActionsService {
  // CHECKME: Move this out of here?
  private readonly cardFacePerCardApiService: CardFacePerCardApiService = inject<CardFacePerCardApiService>(CardFacePerCardApiService);

  private readonly atlasExportService: AtlasExportService = inject<AtlasExportService>(AtlasExportService);

  private readonly cardEditorFaceModalService: CardEditorFaceModalService = inject<CardEditorFaceModalService>(CardEditorFaceModalService);

  private readonly cardEditorFacadeService: CardEditorFacadeService = inject<CardEditorFacadeService>(CardEditorFacadeService);

  private readonly cardEditorModalService: CardEditorModalService = inject<CardEditorModalService>(CardEditorModalService);

  private readonly cardFaceElementService: CardFaceElementService = inject<CardFaceElementService>(CardFaceElementService);

  private readonly cardFaceElementRtService: CardFaceElementRtService = inject<CardFaceElementRtService>(CardFaceElementRtService);

  private readonly cardFaceElementImageService: CardFaceElementImageService = inject<CardFaceElementImageService>(CardFaceElementImageService);

  private readonly cardEditorOperationsService: CardEditorOperationsService = inject<CardEditorOperationsService>(CardEditorOperationsService);

  private readonly cardFaceLodsService: CardFaceLodsService = inject<CardFaceLodsService>(CardFaceLodsService);

  public flipAction(card: Card, cards: Card[]): void {
    if (!card || !cards) return;

    let idx: number = cards.findIndex(c => c.cardId === card.cardId);

    if (idx < 0) return;

    this.cardFacePerCardApiService.getCardFacesPerCardIds$(card).subscribe((cardFaceIds: string[]) => {
      cards[idx] = {
        ...card,
        currentCardFaceId: setCurrentCardFaceId(getCurrentCardFaceIndex(getCurrentCardFaceId(card), cardFaceIds), cardFaceIds)
      };
    });
  }

  // FIXME: Why doesn't this work
  public editCardAction(cardId: string): void {
    if (!cardId) return;

    console.log(`%c${logInfo(this.constructor.name, this.editCardAction.name)}\ncardId: ${cardId}`, `color: #8D77AB; background: #BAD8B6; padding: 5px; border-radius: 5px;`);

    this.cardEditorFacadeService.getCardEditorCardDtoByCardId(cardId);
    this.cardEditorModalService.toggleCardEditor(true);
  }

  public deleteCardAction(cardId: string): void {
    this.cardEditorFacadeService.deleteCard(cardId);
  }

  public getCollectionMenuItems(currentContextMenuId: string, currentCardInEditorId: string): ActionContextMenuItem[] {
    return [
      {
        id: 0,
        name: 'Flip',
        action: (params: { card: Card, cards: Card[] }) => {
          let { card, cards } = params;

          this.flipAction(card, cards);
        },
        disabled: false
      },
      {
        id: 1,
        name: 'Edit Card',
        action: (params: { cardId: string }) => {
          let { cardId } = params;

          this.editCardAction(cardId);
        },
        disabled: false
      },
      {
        id: 2,
        name: 'Delete Card',
        action: (params: { cardId: string}) => {
          let { cardId } = params;

          this.deleteCardAction(cardId);
        },
        disabled: currentContextMenuId === currentCardInEditorId
      }
    ];
  }


  /*************** TODO: Best to move these somewhere else ******************/
  private isValidCard(cardEditorCardDto: CardEditorCardDto): boolean {
    if (!cardEditorCardDto) throw new Error(`${logInfo(this.constructor.name, this.isValidCard.name)}: No card editor card cardEditorCardDto to be found`);

    if (cardEditorCardDto.card.cardId === "0") throw new Error(`${logInfo(this.constructor.name, this.isValidCard.name)}: Can't import export a card that hasn't been made yet.`);

    return true;
  }

  public async importCardAction(
    cardEditorCardDto: CardEditorCardDto,
    destroyRef: DestroyRef
  ): Promise<void> {
    // CHECKME: You should be able to import cards that have already been deleted and elements that have been already deleted
    this.isValidCard(cardEditorCardDto);

    let imported: CardEditorCardDto = { ...cardEditorCardDto };

    console.log(`%c${logInfo(this.constructor.name, this.importCardAction.name)} (before):\nimported:${stringify(imported)}}`, `color: #01161e; background: #eff6e0; padding: 5px; border-radius: 5px;`);

    let { cardEditorCardFacesDto } = imported;

    await this.cardFaceElementImageService.duplicateCardFaceElementImages$(imported, destroyRef);

    console.log(`%c${logInfo(this.constructor.name, this.importCardAction.name)} (after duplication):\nimported:${stringify(imported)}}`, `color: #48A9A6; background: #731DD8; padding: 5px; border-radius: 5px;`);

    let attrs: {
      cardFaceElementIdentifiers: {
        cardFaceElementId: string;
        cardFaceElementType: "Rt" | "Image";
        cardFaceElementZIndex: string;
        cardFaceElementPerCardFaceId: string;
      }[];
      cardFaceElementPositions: Map<string, Coordinates>;
      cardFaceElementDimensions: Map<string, Dimensions>;
      cardFaceElementRts: Map<string, string>;
      cardFaceElementImages: Map<string, string>;
    }[] = await Promise.all(
      cardEditorCardFacesDto.map((value: CardEditorCardFaceDto) => {
        let { cardFaceElementsPerCardFace } = value;

        return this.setCardFaceElementAttributes(cardFaceElementsPerCardFace, destroyRef);
      })
    );

    let lods$: Observable<FileMetadata[] | undefined>[] = attrs.map((attr: {
      cardFaceElementIdentifiers: {
        cardFaceElementId: string;
        cardFaceElementType: "Rt" | "Image";
        cardFaceElementZIndex: string;
        cardFaceElementPerCardFaceId: string;
      }[];
      cardFaceElementPositions: Map<string, Coordinates>;
      cardFaceElementDimensions: Map<string, Dimensions>;
      cardFaceElementRts: Map<string, string>;
      cardFaceElementImages: Map<string, string>;
    }, idx: number) => {
      let cardEditorCardFaceDto: CardEditorCardFaceDto = cardEditorCardFacesDto[idx];

      let {
        cardFaceElementIdentifiers,
        cardFaceElementPositions,
        cardFaceElementDimensions,
        cardFaceElementRts,
        cardFaceElementImages
      } = attr;

      let id: string = this.cardEditorFaceModalService.createCardEditorFaceInstance(
        cardEditorCardFaceDto.cardFace.style,
        cardFaceElementIdentifiers,
        cardFaceElementPositions,
        cardFaceElementDimensions,
        cardFaceElementRts,
        cardFaceElementImages
      );

      let inst: {
        host: HTMLElement,
        ref: ComponentRef<CardEditorFaceComponent>
      } | undefined = this.cardEditorFaceModalService.instances.get(id);

      if (!inst) throw new Error();

      let {ref} = inst;

      ref.changeDetectorRef.detectChanges();

      return this.cardFaceLodsService.setCardFaceThumbnailImages$(ref.instance.cardEditorFace, destroyRef, FileMetadataStatus.Attached);
    });

    forkJoin(lods$)
      .pipe(
        tap((results: (FileMetadata[] | undefined)[]) => {
          console.log(`%c${logInfo(this.constructor.name, this.importCardAction.name)} - results:\n${stringify(results)}\ncardEditorCardFacesDto:\n${stringify(cardEditorCardDto.cardEditorCardFacesDto)}`, 'color: #899E8B; background: #e6fff6; padding: 5px; border-radius: 5px;');

          imported.cardEditorCardFacesDto.forEach((value: CardEditorCardFaceDto, index: number) => {
            this.cardFaceLodsService.orphanCardFaceLods(value.fileMetadataLods);

            let lods: FileMetadata[] | undefined = results[index];
            if (lods) value.fileMetadataLods = lods;
          });

          this.cardEditorFaceModalService.clearCardEditorFaceInstances();
        }),
        switchMap(() => this.cardEditorFacadeService.createCardEditorCardDto$(imported)
        )
      )
      .subscribe((result: CardEditorCardDto | undefined) => { // FIXME: Cannot read properties of undefined (reading 'nativeElement')
        if (!result) throw new Error(`${logInfo(this.constructor.name, this.importCardAction.name)}: Invalid import, can't import card`);

        this.cardEditorOperationsService.importOperation('create', result);

        // TODO: Make a flag that can automatically just open the card in the editor
        if (window.confirm('Open imported card in editor? The currently opened card will be overridden in the editor..')) {
          this.cardEditorFacadeService.setCardEditorCardDtoByCardId(result.card.cardId);
        }
      });
  }

  public exportCardAction(cardEditorCardDto: CardEditorCardDto): void {
    this.isValidCard(cardEditorCardDto);

    let exported: CardEditorCardDto = { ...cardEditorCardDto };

    exported.cardEditorCardFacesDto.forEach((value: CardEditorCardFaceDto) => {
      value.fileMetadataLods = [];
    });

    exportCustomTypeFile(Object.fromEntries(Object.entries(JSON.parse(stringify(exported)) as CardEditorCardDto)), `${cardEditorCardDto.card.cardId}`, 'sbd');
  }

  public exportAtlasAction(
    cardEditorCardDto: CardEditorCardDto
  ): void {
    this.isValidCard(cardEditorCardDto);

    this.cardFacePerCardApiService.getCardFacesByLod$(cardEditorCardDto.card.cardId, DEFAULT_ATLAS_EXPORT_LOD).subscribe({
      next: async (result: Blob | undefined) => {
        if (!result) throw new Error("There are no card faces thumbnails");

        let images: HTMLImageElement[] | undefined = await unzipImages(result);

        if (!images) throw new Error("Failed to unzip images");

        let results = await canvasSize.maxArea({
          max: 10000,
          min: 1,
          step: 100,
          // useWorker: true,
          onError(results) {
            console.error('🔴', results);
          },
          usePromise: true
        });

        this.atlasExportService.atlasExport(images, cardEditorCardDto.card.cardId, {
          width: results.width,
          height: results.height
        });
      }
    });
  }

  // TODO: Make this more modular and reusable, look at card-editor-facade-service
  private async setCardFaceElementAttributes(
    cardFaceElementsPerCardFace: CardFaceElementPerCardFace[],
    destroyRef: DestroyRef
  ): Promise<{
    cardFaceElementIdentifiers: {
      cardFaceElementId: string;
      cardFaceElementType: "Rt" | "Image";
      cardFaceElementZIndex: string;
      cardFaceElementPerCardFaceId: string;
    }[];
    cardFaceElementPositions: Map<string, Coordinates>;
    cardFaceElementDimensions: Map<string, Dimensions>;
    cardFaceElementRts: Map<string, string>;
    cardFaceElementImages: Map<string, string>;
  }> {
    let cardFaceElementIdentifiers: {
      cardFaceElementId: string;
      cardFaceElementType: "Rt" | "Image";
      cardFaceElementZIndex: string;
      cardFaceElementPerCardFaceId: string;
    }[] = [];

    let cardFaceElementPositions: Map<string, Coordinates> = new Map<string, Coordinates>();
    let cardFaceElementDimensions = new Map<string, Dimensions>();
    let cardFaceElementRts: Map<string, string> = new Map<string, string>();
    let cardFaceElementImages: Map<string, string> = new Map<string, string>();

    for (let cardFaceElementPerCardFace of cardFaceElementsPerCardFace) {
      let { cardFaceElement, cardFaceElementPerCardFaceId } = cardFaceElementPerCardFace;

      cardFaceElementIdentifiers.push({
        cardFaceElementId: cardFaceElement.cardFaceElementId,
        cardFaceElementType: cardFaceElement.cardFaceElementType,
        cardFaceElementZIndex: cardFaceElement.style?.zIndex ?? 'inherit',
        cardFaceElementPerCardFaceId
      });

      cardFaceElementPositions.set(cardFaceElement.cardFaceElementId, {
        x: cardFaceElementPerCardFace.dndPosition.x,
        y: cardFaceElementPerCardFace.dndPosition.y
      });

      cardFaceElementDimensions.set(
        cardFaceElement.cardFaceElementId,
        this.cardFaceElementService.getCardFaceElementDimensions(cardFaceElement)
      );
    }

    let cardFaceElementRtsPerCardFace: CardFaceElementPerCardFace[] = cardFaceElementsPerCardFace.filter((cardFaceElementPerCardFace: CardFaceElementPerCardFace) =>
      this.cardFaceElementRtService.isRt(cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId, cardFaceElementsPerCardFace)
    );

    // FIXME: It's setting the RTs, but why isn't it actually being taken in the LODs
    cardFaceElementRtsPerCardFace.map((cardFaceElementRt: CardFaceElementPerCardFace) => {
      cardFaceElementRts.set(cardFaceElementRt.cardFaceElement.cardFaceElementId,this.cardFaceElementRtService.getRt(cardFaceElementRt.cardFaceElement.cardFaceElementId, cardFaceElementsPerCardFace));
    });

    let cardFaceElementImagesPerCardFace: CardFaceElementPerCardFace[] = cardFaceElementsPerCardFace.filter((cardFaceElementPerCardFace: CardFaceElementPerCardFace) =>
      this.cardFaceElementImageService.isImage(cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId, cardFaceElementsPerCardFace)
    );

    let results: {
      cardFaceElementId: string;
      htmlImageElementSrc: string;
    }[] = await firstValueFrom(this.cardFaceElementImageService.getAllImageSrcs$(cardFaceElementImagesPerCardFace, destroyRef));

    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceElementAttributes.name)}: Results:\n${stringify(results)}`, `color: #0D1F22; background: #6F732F; padding: 5px; border-radius: 5px;`);

    results.forEach((result: {
      cardFaceElementId: string;
      htmlImageElementSrc: string;
    }) => {
      cardFaceElementImages.set(result.cardFaceElementId, result.htmlImageElementSrc);
    });

    return {
      cardFaceElementIdentifiers,
      cardFaceElementPositions,
      cardFaceElementDimensions,
      cardFaceElementRts,
      cardFaceElementImages
    };
  }

  public getPreviewMenuItems(): ActionContextMenuItem[] {
    return [
      {
        id: 0,
        name: 'Import Card (.sbd)',
        action: async (params: {
          cardEditorCardDto: CardEditorCardDto,
          destroyRef: DestroyRef
        }) => {
          let { cardEditorCardDto, destroyRef } = params;

          this.importCardAction(cardEditorCardDto, destroyRef);
        },
        disabled: false
      },
      {
        id: 1,
        name: 'Export Card (.sbd)',
        action: (cardEditorCardDto: CardEditorCardDto) => this.exportCardAction(cardEditorCardDto),
        disabled: false
      },
      {
        id: 2,
        name: 'Export Atlas',
        action: (cardEditorCardDto: CardEditorCardDto) => this.exportAtlasAction(cardEditorCardDto),
        disabled: false
      }
    ];
  }
}
