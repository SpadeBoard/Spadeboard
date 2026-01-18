import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import canvasSize from 'canvas-size';
import { catchError, defer, forkJoin, iif, map, merge, Observable, Subject, Subscription, switchMap, tap, throwError } from 'rxjs';
import { assertObjectsMatch } from '../../../../../../utils/checks.utils';
import { AtlasExportService } from '../../../../../../utils/services/atlas-export/atlas-export.service';
import { exportCustomTypeFile, operate, stringify, unzipImages } from '../../../../../../utils/utils';
import { ActionContextMenuItem } from '../../../../../actions-context-menu/models/action-context-menu-item';
import { Card, CardEditorCardDto } from '../../../../models/card';
import { CardEditorCardFaceDto } from '../../../../models/card-face';
import { CardFaceElement, CardFaceElementPerCardFace } from '../../../../models/card-face-element';
import { DEFAULT_ATLAS_EXPORT_LOD } from '../../../../utils/card-editor.constants';
import { assertCardFaceElements } from '../../../../utils/card-face-element.constants';
import { CardEditorCardDtoApiService } from '../../api/card-editor-card-dto-api.service';
import { CardFacePerCardApiService } from '../../api/card-face-per-card-api.service';
import { CardApiService } from '../../card/api/card-api.service';
import { CardEditorApiService } from '../api/card-editor-api.service';
import { CardEditorPreviewService } from '../preview/card-editor-preview.service';
import { CardFaceLodsService } from '../../card-face/lods/card-face-lods.service';

@Injectable({
  providedIn: 'root'
})
export class CardEditorOperationsService {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);

  private readonly cardEditorCardDtoApiService: CardEditorCardDtoApiService = inject(CardEditorCardDtoApiService);

  private readonly cardApiService: CardApiService = inject(CardApiService);

  private readonly cardFacesPerCardApiService: CardFacePerCardApiService = inject(CardFacePerCardApiService);

  private readonly cardFaceLodsService: CardFaceLodsService = inject(CardFaceLodsService);

  private readonly atlasExportService: AtlasExportService = inject(AtlasExportService);

  private createCard$$: Subject<void> = new Subject<void>();
  public readonly createCard$: Observable<void> = this.createCard$$.asObservable();

  private saveCard$$: Subject<void> = new Subject<void>();
  public readonly saveCard$: Observable<void> = this.saveCard$$.asObservable();

  private onFlip$$: Subject<void> = new Subject<void>();
  public readonly onFlip$: Observable<void> = this.onFlip$$.asObservable();

  private postFlip$$: Subject<void> = new Subject<void>();
  public readonly postFlip$: Observable<void> = this.postFlip$$.asObservable();

  constructor() { }

  private isValidCard(cardEditorCardDto: CardEditorCardDto): boolean {
    if (!cardEditorCardDto) throw new Error(`${this.constructor.name} - ${this.isValidCard.name}: No card editor card cardEditorCardDto to be found`);

    if (cardEditorCardDto.card.cardId === "0") throw new Error(`${this.constructor.name} - ${this.isValidCard.name}: Can't import export a card that hasn't been made yet.`);

    return true;
  }

  private importCardAction(cardEditorCardDto: CardEditorCardDto, duplicateCardObservables: Array<Observable<any>>): void {
    // CHECKME: You should be able to import cards that have already been deleted and elements that have been already deleted
    this.isValidCard(cardEditorCardDto);

    let imported: CardEditorCardDto = { ...cardEditorCardDto };

    console.log(`%c${this.constructor.name} - ${this.importCardAction.name} (time: ${Date.now().toLocaleString("en-US")}) (before):\nimported:${stringify(imported)}}`, `color: #01161e; background: #eff6e0; padding: 5px; border-radius: 5px;`);

    // FIXME: Ok, we really shouldn't mutate a shared input, this is what's causing issues.
    // Last mutation always win so that's why
    let lods$: Observable<string[] | undefined>[] = imported.cardEditorCardFacesDto.map((value, index) => {
      return this.cardFaceLodsService.createCardEditorCardFaceDtoLods$(imported, index);
    })
   
    forkJoin(lods$)
      .pipe(
        tap((results: (string[] | undefined)[]) => {
          console.log(`%c${this.constructor.name} - ${this.importCardAction.name} (time: ${Date.now().toLocaleString("en-US")}) - results:\n${stringify(results)}\ncardEditorCardFacesDto:\n${stringify(cardEditorCardDto.cardEditorCardFacesDto)}`, 'color: #899E8B; background: #e6fff6; padding: 5px; border-radius: 5px;');

          this.cardFaceLodsService.clearCardEditorFacePreviewInstances();
        }),
        switchMap(() => this.cardApiService.exists$(imported.card.cardId)),
        switchMap((exists: boolean) => {
          return iif(
            () => exists,
            defer(() => {
              console.log(`%c${this.constructor.name} - ${this.importCardAction.name}: duplicateCardEditorCardDto (before)`, `color: #2A324B; background: #C7CCDB; padding: 5px; border-radius: 5px;`);
              return this.duplicateCardEditorCardDto$(imported, duplicateCardObservables); // CHECKME: Can we simplify this by just creating the imported card (setting all IDs to 0) and running the duplicateCardObservables beforehand?
            }),
            defer(() => {
              console.log(`%c${this.constructor.name} - ${this.importCardAction.name}: createCardEditorCardDto (before)`, `color: #005442; background: #FCE4D8; padding: 5px; border-radius: 5px;`);
              return this.createCardEditorCardDto$(imported);
            })
          );
        })
      )
      .subscribe((result: CardEditorCardDto | undefined) => {
        if (!result) throw new Error(`${this.constructor.name} - ${this.importCardAction.name}: Invalid import, can't import card`);

        this.cardEditorApiService.setOperation('create', result);

        // TODO: Make a flag that can automatically just open the card in the editor
        if (window.confirm('Open imported card in editor? The currently opened card will be overridden in the editor..')) {
          this.cardEditorPreviewService.setCardEditorCardDtoByCardId(result.card.cardId);
        }
      });
  }

  private exportCardAction(cardEditorCardDto: CardEditorCardDto): void {
    this.isValidCard(cardEditorCardDto);

    let exported: CardEditorCardDto = { ...cardEditorCardDto };

    exported.cardEditorCardFacesDto.forEach((value: CardEditorCardFaceDto) => {
      value.fileMetadataLods = [];
    });

    // FIXME: Why is it not filtering out the fileMetadataLods
    exportCustomTypeFile(Object.fromEntries(Object.entries(JSON.parse(stringify(exported)) as CardEditorCardDto)), `${cardEditorCardDto.card.cardId}`, 'sbd');
  }

  private exportAtlasAction(cardEditorCardDto: CardEditorCardDto): void {
    this.isValidCard(cardEditorCardDto);

    this.cardFacesPerCardApiService.getCardFacesByLod$(cardEditorCardDto.card.cardId, DEFAULT_ATLAS_EXPORT_LOD).subscribe({
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

  // TODO: Have action context menu items be groupable
  public getPreviewMenuItems(): ActionContextMenuItem[] {
    return [
      {
        id: 0,
        name: 'Import Card (.sbd)',
        action: (params: { cardEditorCardDto: CardEditorCardDto, duplicateCardObservables: Array<Observable<any>> }) => {
          let { cardEditorCardDto, duplicateCardObservables } = params;

          this.importCardAction(cardEditorCardDto, duplicateCardObservables)
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

  private flipAction(card: Card, cards: Card[]): void {
    if (!card || !cards) return;

    let idx: number = cards.findIndex(c => c.cardId === card.cardId);
    if (idx !== -1) {
      cards[idx] = {
        ...card,
        currentCardFaceIndex: (card.currentCardFaceIndex === 0) ? 1 : 0
      };
    }
  }

  public editCardAction(cardId: string, cardEditorPreviewService: CardEditorPreviewService): void {
    if (!cardId || !cardEditorPreviewService) return;

    console.log(`%c${this.constructor.name} - ${this.editCardAction.name}\ncardId: ${cardId}`, `color: #8D77AB; background: #BAD8B6; padding: 5px; border-radius: 5px;`);

    cardEditorPreviewService.getCardEditorCardDtoByCardId(cardId);
    cardEditorPreviewService.toggleCardEditor(!cardEditorPreviewService.$isCardEditorOpen());
  }

  public deleteCardAction(cardId: string, cardEditorPreviewService: CardEditorPreviewService): void {
    if (cardId !== cardEditorPreviewService.cardEditorCardDto.card.cardId) this.deleteCard(cardId);
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
        action: (params: { cardId: string, cardEditorPreviewService: CardEditorPreviewService }) => {
          let { cardId, cardEditorPreviewService } = params;

          this.editCardAction(cardId, cardEditorPreviewService);
        },
        disabled: false
      },
      {
        id: 2,
        name: 'Delete Card',
        action: (params: { cardId: string, cardEditorPreviewService: CardEditorPreviewService }) => {
          let { cardId, cardEditorPreviewService } = params;

          this.deleteCardAction(cardId, cardEditorPreviewService);
        },
        disabled: currentContextMenuId === currentCardInEditorId
      }
    ];
  }

  /*******************************************************/
  // https://stackoverflow.com/questions/51860068/rxjs-6-conditionally-pipe-an-observable
  // https://www.learnrxjs.io/learn-rxjs/operators/conditional/iif
  public createCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    return this.cardEditorCardDtoApiService.createCardEditorCardDto$(cardEditorCardDto).pipe(
      catchError(err => {
        console.error('Something went wrong:', err);
        return throwError(() => err);
      })
    );
  }

  private assertCardFaceElementsPerCardFace(fn: string, original: CardEditorCardDto, duplicate: CardEditorCardDto): void {
    let assertions: Array<Map<string, CardFaceElementPerCardFace[]>> = [];

    original.cardEditorCardFacesDto.forEach((cardEditorCardFaceDto: CardEditorCardFaceDto, index: number) => {
      if (cardEditorCardFaceDto.cardFaceElementsPerCardFace) {
        assertions.push(new Map<string, CardFaceElementPerCardFace[]>([
          [`Original - ${index}`, cardEditorCardFaceDto.cardFaceElementsPerCardFace],
          [`Duplicated - ${index}`, duplicate.cardEditorCardFacesDto[index].cardFaceElementsPerCardFace],
        ]));
      }
    });

    if (assertions.some(assertion => assertObjectsMatch(assertion, `${this.constructor.name} - ${this.assertCardFaceElementsPerCardFace.name}`))) throw new Error(`${fn}: Card face elements per card face are identical`);
  }

  // TODO: Finish this assertion and test it
  private assertCardFaceElements(fn: string, original: CardEditorCardDto, duplicate: CardEditorCardDto): void {
    let assertions: Array<Map<string, CardFaceElement[]>> = [];

    original.cardEditorCardFacesDto.forEach((cardEditorCardFaceDto: CardEditorCardFaceDto, index: number) => {
      if (cardEditorCardFaceDto.cardFaceElementsPerCardFace) {
        assertions.push(new Map<string, CardFaceElement[]>([
          [`Original - ${index}`, cardEditorCardFaceDto.cardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) => value.cardFaceElement)],
          [`Duplicated - ${index}`, duplicate.cardEditorCardFacesDto[index].cardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) => value.cardFaceElement)],
        ]));
      }
    });

    if (assertions.some(assertion => !assertCardFaceElements(assertion))) throw new Error(`${fn}: Card face elements aren\'t unique.`);
  }

  public duplicateCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto, duplicateCardObservables: Array<Observable<any>>): Observable<CardEditorCardDto | undefined> {
    return forkJoin(duplicateCardObservables).pipe(
      switchMap(() =>
        this.cardEditorCardDtoApiService.createCardEditorCardDto$(cardEditorCardDto)
      ),
      tap((value: CardEditorCardDto | undefined) => {
        if (!value) throw new Error(`${this.constructor.name} - ${this.duplicateCardEditorCardDto$.name}: No card editor card dto duplicated`);

        let fn: string = `${this.duplicateCardEditorCardDto$.name}`;

        this.assertCardFaceElementsPerCardFace(fn, cardEditorCardDto, value);
        this.assertCardFaceElements(fn, cardEditorCardDto, value);
      }),
      catchError((err: unknown) => {
        console.error(`${this.constructor.name} - ${this.duplicateCardEditorCardDto$.name}: Something went wrong:`, err);
        return throwError(() => err);
      })
    );
  }

  public updateCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    return this.cardEditorCardDtoApiService.updateCardEditorCardDto$(cardEditorCardDto).pipe(
      catchError(err => {
        console.error(`${this.constructor.name} - ${this.updateCardEditorCardDto$.name}: Something went wrong:`, err);
        return throwError(() => err);
      })
    );
  }

  public canDeleteCard(cardId: string): boolean {
    if (!cardId) return false;

    return !(this.cardEditorPreviewService.cardEditorCardDto.card.cardId === cardId);
  }

  public deleteCard(cardId: string): void {
    console.log(`%c${this.constructor.name} - ${this.deleteCard.name}:\ncardId: ${cardId}`, `color: #4a5759; background: #edafb8; padding: 5px; border-radius: 5px;`);

    if (!this.canDeleteCard(cardId)) {
      throw new Error("Can't delete card as it's being edited or it's being undefined");
    }

    this.cardEditorCardDtoApiService.deleteCardEditorCardDtoByCardId$(cardId)
      .subscribe(() => {
        this.cardEditorApiService.deletedCardEditorCardDto(cardId);
      });
  }

  /***************************************************/
  public clickCreate(): void {
    this.createCard$$.next();
  }

  public clickSave(): void {
    this.saveCard$$.next();
  }

  public onClickOperations(cardEditorFacePreviewOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.createCard$.pipe(
        map(() => 'create')
      ),
      this.saveCard$.pipe(
        map(() => 'save')
      )
    )
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((operation: string) => {
        operate(operation, cardEditorFacePreviewOperations);
      });
  }

  public onFlip(): void {
    this.onFlip$$.next();
  }

  public postFlip(): void {
    this.postFlip$$.next();
  }

  public onProcessFlip(processFlipOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.onFlip$.pipe(
        map(() => 'on')
      ),
      this.postFlip$.pipe(
        map(() => 'post')
      )
    ).pipe(
      takeUntilDestroyed(destroyRef)
    )
      .subscribe((stage: string) => {
        operate(stage, processFlipOperations);
      });
  }
}