import { DestroyRef, ElementRef, inject, Injectable, ModelSignal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagData } from 'ngx-tagify';
import { catchError, defer, forkJoin, iif, map, Observable, of, Subscription, switchMap, tap, throwError } from 'rxjs';
import { assertObjectsMatch } from '../../../../../utils/checks.utils';
import { FileMetadata } from '../../../../../utils/models/file-metadata';
import { FileMetadataService } from '../../../../../utils/services/file/metadata/facade/file-metadata.service';
import { Coordinates, Dimensions, logInfo, parseNumeric, stringify, unsubscription } from '../../../../../utils/utils';
import { DndPosition } from '../../../../drag-and-drop/models/dnd-position';
import { BorderDimensions, Style } from '../../../../style/models/style';
import { Tag } from '../../../../tagging-system/models/tag';
import { CardEditorCardDtoApiService } from '../../../card-editor-card-dto/services/api/card-editor-card-dto-api.service';
import { CardFaceElementImageService } from '../../../card-face-element/components/subtypes/image/service/card-face-element-image.service';
import { CardFaceElementRteService } from '../../../card-face-element/components/subtypes/rich-text-editor/service/card-face-element-rte.service';
import { CardFaceElementRtService } from '../../../card-face-element/components/subtypes/rich-text/service/card-face-element-rt.service';
import { CardFaceElement, CardFaceElementImage, CardFaceElementPerCardFace } from '../../../card-face-element/models/card-face-element';
import { CardFaceElementService } from '../../../card-face-element/services/core/card-face-element.service';
import { CardFaceLodsService } from '../../../card-face-per-lod/services/core/card-face-lods.service';
import { CardFace } from '../../../card-face/models/card-face';
import { Card } from '../../../card/models/card';
import { CardTemplateService } from '../../../card/services/template/card-template.service';
import { CardFaceElementImageEditorService } from '../../../card-face-element/components/subtypes/image-editor/service/core/card-face-element-image-editor.service';
import { CardEditorPreviewService } from '../../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardFaceStyleService } from '../../../services/card-game-core/card-face/style/card-face-style.service';
import { assertCardFaceElements } from '../../../utils/card-face-element.constants';
import { DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X, DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID } from '../../constants/card-editor.constants';
import { CardEditorCardDto } from '../../models/card-editor-card-dto';
import { CardEditorCardFaceDto } from '../../models/card-editor-card-face-dto';
import { CardEditorOperationsService } from '../operations/card-editor-operations.service';
import { CardEditorTagService } from '../tags/card-editor-tag.service';
import { CardFaceElementImageModalService } from '../../../card-face-element/components/subtypes/image-editor/service/modal/card-face-element-image-modal.service';
import { DEFAULT_CARD_FACE_DIMENSIONS } from '../../../card-face/constants/card-face.constants';

@Injectable({
  providedIn: 'root',
})
// TODO: Put this inside of the card-editor.component
export class CardEditorFacadeService {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject<CardEditorPreviewService>(CardEditorPreviewService); // TODO: Rename cardEditorPreviewService to cardEditorCardDtoService

  private readonly cardEditorCardDtoApiService: CardEditorCardDtoApiService = inject<CardEditorCardDtoApiService>(CardEditorCardDtoApiService);

  private readonly cardEditorOperationsService: CardEditorOperationsService = inject<CardEditorOperationsService>(CardEditorOperationsService);

  private readonly cardEditorTagService: CardEditorTagService = inject<CardEditorTagService>(CardEditorTagService);

  private readonly cardFaceLodsService: CardFaceLodsService = inject<CardFaceLodsService>(CardFaceLodsService); // FIXME: Circular dependency issue? -> references fileMetadataService

  private readonly fileMetadataService: FileMetadataService = inject<FileMetadataService>(FileMetadataService); // FIXME: Circular dependency issue

  private readonly cardTemplateService: CardTemplateService = inject<CardTemplateService>(CardTemplateService);

  private readonly cardFaceStyleService: CardFaceStyleService = inject<CardFaceStyleService>(CardFaceStyleService);

  private readonly cardFaceElementService: CardFaceElementService = inject<CardFaceElementService>(CardFaceElementService);

  private readonly cardFaceElementRtService: CardFaceElementRtService = inject<CardFaceElementRtService>(CardFaceElementRtService);

  private readonly cardFaceElementRteService: CardFaceElementRteService = inject<CardFaceElementRteService>(CardFaceElementRteService);

  private readonly cardFaceElementImageService: CardFaceElementImageService = inject<CardFaceElementImageService>(CardFaceElementImageService);

  private readonly cardFaceElementImageEditorService: CardFaceElementImageEditorService = inject<CardFaceElementImageEditorService>(CardFaceElementImageEditorService);

  private readonly cardFaceElementImageModalService: CardFaceElementImageModalService = inject<CardFaceElementImageModalService>(CardFaceElementImageModalService);

  /***************** SIGNALS *********************/
  public $currentCardFaceElementId: WritableSignal<string> = signal<string>('');

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

  /************* ORPHAN/CLEAR ****************/
  public orphan(destroyRef: DestroyRef): void {
    this.fileMetadataService.orphan$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        this.cardFaceLodsService.orphanFileMetadata();
        this.cardFaceElementImageService.orphanFileMetadata();
      });
  }

  public clear(destroyRef: DestroyRef): void {
    this.cardEditorOperationsService.clear$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        this.cardEditorTagService.clear();
        this.cardTemplateService.clear();

        // CHECKME: Is this being used correctly
        this.cardFaceLodsService.clear();
        this.cardFaceElementImageService.clear();
        this.cardFaceElementService.clear(); // CHECKME: Do we clear here?
      });
  }

  /************** PUBLIC INFO ABOUT cardEditorCardDto *****************/
  public getCurrentOwnerId(): string {
    return this.cardEditorPreviewService.cardEditorCardDto.ownerId ?? '';
  }

  public getCurrentCardEditorCardDto(): CardEditorCardDto {
    return this.cardEditorPreviewService.cardEditorCardDto;
  }

  public getCurrentCardId(): string {
    return this.cardEditorPreviewService.cardEditorCardDto.card.cardId;
  }

  public getCurrentCardFaceId(): string {
    return this.cardEditorPreviewService.getCurrentCardFace().cardFaceId;
  }

  public getCurrentCardFace(): CardFace {
    return this.cardEditorPreviewService.getCurrentCardFace();
  }

  public getCardName(): string {
    return this.cardEditorPreviewService.cardEditorCardDto.card.cardName;
  }

  public changeCardName(cardName: string): void {
    this.cardEditorPreviewService.cardEditorCardDto.card.cardName = cardName;
  }

  public getCardTagNames(): readonly string[] {
    return this.cardEditorPreviewService.cardEditorCardDto.tagNames;
  }

  public isFlipped(): boolean {
    return (this.cardEditorPreviewService.getCurrentCardFaceIndex()) ? false : true;
  }

  public hasCreated(): boolean {
    // CHECKME: Is the cardEditorCardDto being updated properly?
    return !this.cardEditorPreviewService.isNewCardEditorCardDto();
  }

  public getCardFaceElementsPerCardFaceAmt(): number {
    return this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace().length;
  }

  public setCurrentCardFaceElementsPerCardFace(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    this.cardEditorPreviewService.setCurrentCardFaceElementsPerCardFace(currentCardFaceElementsPerCardFace);
  }

  public setCardEditorCardDto$(): Observable<void> {
    return this.cardEditorPreviewService.setCardEditorCardDto$;
  }

  public getCurrentCardFaceStyle(): Style {
    return this.cardEditorPreviewService.getCurrentCardFaceStyle();
  }

  public getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return { ...this.cardFaceStyleService.getStyle(this.getCurrentCardFaceStyle()), margin: 'auto' };
  }

  public setCurrentCardFaceStyle(style: Style): void {
    this.cardEditorPreviewService.setCurrentCardFaceStyle(style);
  }

  public getCardFaceElementPerCardFace(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): CardFaceElementPerCardFace {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.cardFaceElementService.getCardFaceElementPerCardFace(cardFaceElementId, cardFaceElementsPerCardFace);
    if (!cardFaceElementPerCardFace) throw new Error("Card editor face preview: There is no current card face element per card face to set attributes");
    return cardFaceElementPerCardFace;
  }

  public getCardFaceElementPerCardFaceDimensions(cardFaceElementPerCardFace: CardFaceElementPerCardFace): Dimensions {
    return this.cardFaceElementService.getCardFaceElementDimensions(cardFaceElementPerCardFace);
  }

  public getCardFaceElementPerCardFacePosition(cardFaceElementPerCardFace: CardFaceElementPerCardFace): Coordinates {
    return this.cardFaceElementService.getCardFaceElementPosition(cardFaceElementPerCardFace);
  }

  public getCurrentCardFaceElementsPerCardFace(): CardFaceElementPerCardFace[] {
    return this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace();
  }

  public toggleCurrentCardFace(): void {
    this.cardEditorPreviewService.toggleCurrentCardFace();
  }

  /******************* TAG **********************/
  public addTag(tag: Tag): void {
    this.cardEditorTagService.addTag(tag, this.getCurrentCardEditorCardDto(), this.cardEditorTagService.tagNamesToDelete);
  }

  public updateTag(idx: number, tag: Tag): void {
    this.cardEditorTagService.updateTag(idx, tag, this.getCurrentCardEditorCardDto(), this.cardEditorTagService.tagNamesToDelete);
  }

  public deleteTag(tag: Tag): void {
    this.cardEditorTagService.deleteTag(tag, this.getCurrentCardEditorCardDto(), this.cardEditorTagService.tagNamesToDelete);
  }

  /************** ACTIVATE ****************/
  public activateOperationsSubscription(processOperationHandlers: Map<string, Function>,
    destroyRef: DestroyRef,
    args: {
      cardEditorFace: ElementRef
    }): Subscription {
    return this.cardEditorOperationsService.activateOperationsSubscription(processOperationHandlers, destroyRef, args);
  }

  public activateCreateCard(userId: string): void {
    // CHECKME: Assign owner here?
    this.cardEditorPreviewService.cardEditorCardDto.ownerId = userId;
    this.cardEditorOperationsService.activateCreate(); // TODO: We wanna call activateCreateCard$$
  }

  public activateSaveCard(): void {
    this.cardEditorOperationsService.activateSave();
  }

  /******************************/
  public getCardEditorCardDtoByCardId$(cardId: string): Observable<CardEditorCardDto | undefined> {
    return this.cardEditorCardDtoApiService.getCardEditorCardDtoByCardId$(cardId);
  }

  // TODO: Rename this
  public getCardEditorCardDtoByCardId(cardId: string): void {
    this.cardEditorCardDtoApiService.getCardEditorCardDtoByCardId$(cardId)
      .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
        if (cardEditorCardDto) {
          console.assert(cardEditorCardDto.card.cardId === cardId, `${logInfo(this.constructor.name, this.getCardEditorCardDtoByCardId.name)}: cardEditorCardDto.card.cardId and cardId (argument) mismatch`);
          this.cardEditorPreviewService.setCardEditorCardDto(cardEditorCardDto);
        }
      });
  }

  public setCardEditorCardDtoByCardId(cardId: string): void {
    // CHECKME:
    // Prevents accidentally orphaning file metadata we stored for a previous card but never did anything with it
    // Also does that with other stuff like tags as well, we don't want to add tags to an uncreated card or accidentally transfer them
    this.cardEditorOperationsService.clear();

    if (parseFloat(cardId) <= 0) {
      this.cardEditorPreviewService.setBlankCardTemplate();
      return;
    }

    // CHECKME:
    // To keep the information that we had, including the orphaned file metadata
    // Actually this is probably unnecessary because the default state is pending, so either way, unless we're creating/saving, it will never be attached
    // if (this.cardEditorCardDto.card.cardId === cardId) return;

    this.getCardEditorCardDtoByCardId(cardId);
  }

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

    if (assertions.some(assertion => assertObjectsMatch(assertion, `${logInfo(this.constructor.name, this.assertCardFaceElementsPerCardFace.name)}`))) console.error(`${fn}: Card face elements per card face are identical`);
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

    if (assertions.some(assertion => !assertCardFaceElements(assertion))) console.error(`${fn}: Card face elements aren\'t unique.`);
  }

  public duplicateCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto, destroyRef: DestroyRef): Observable<CardEditorCardDto | undefined> {
    return forkJoin(
      [
        this.cardFaceElementImageService.duplicateCardFaceElementImages$(cardEditorCardDto, destroyRef),
        this.cardFaceLodsService.duplicateCardFaceThumbnails$(cardEditorCardDto, destroyRef),
      ]
    ).pipe(
      switchMap(() =>
        this.cardEditorCardDtoApiService.createCardEditorCardDto$(cardEditorCardDto)
      ),
      tap((value: CardEditorCardDto | undefined) => {
        if (!value) throw new Error(`${logInfo(this.constructor.name, this.duplicateCardEditorCardDto$.name)}: No card editor card dto duplicated`);

        let fn: string = `${this.duplicateCardEditorCardDto$.name}`;

        this.assertCardFaceElementsPerCardFace(fn, cardEditorCardDto, value);
        this.assertCardFaceElements(fn, cardEditorCardDto, value);
      }),
      catchError((err: unknown) => {
        console.error(`${logInfo(this.constructor.name, this.duplicateCardEditorCardDto$.name)}}: Something went wrong:`, err);
        return throwError(() => err);
      })
    );
  }

  public updateCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    return this.cardEditorCardDtoApiService.updateCardEditorCardDto$(cardEditorCardDto).pipe(
      catchError(err => {
        console.error(`${logInfo(this.constructor.name, this.updateCardEditorCardDto$.name)}: Something went wrong:`, err);
        return throwError(() => err);
      })
    );
  }

  /************* PROCESS **********************/
  public processUpsertCard(
    cardEditorFace: ElementRef,
    destroyRef: DestroyRef
  ): void {
    this.cardFaceLodsService.setCardFaceThumbnailImages$(cardEditorFace, destroyRef)
      .pipe(
        switchMap((fileMetadataLods: FileMetadata[] | undefined) => {
          if (!fileMetadataLods) throw new Error(`${logInfo(this.constructor.name, this.processUpsertCard.name)}: fileMetadataLods is undefined`);

          this.setFileMetadataLods(fileMetadataLods);

          if (this.cardEditorPreviewService.isNewCardEditorCardDto()) {
            return this.createCardEditorCardDto$(this.getCurrentCardEditorCardDto()).pipe(
              map(cardEditorCardDto => ({
                operation: 'create',
                cardEditorCardDto
              }))
            );
          } else {
            return this.duplicateCardEditorCardDto$(this.getCurrentCardEditorCardDto(), destroyRef).pipe(
              map(cardEditorCardDto => ({
                operation: 'duplicate',
                cardEditorCardDto
              }))
            );
          }
        }),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(({ operation, cardEditorCardDto }) => {
        if (!cardEditorCardDto) throw new Error(`${logInfo(this.constructor.name, this.processUpsertCard.name)}: No card editor card dto`);

        if (operation !== 'create' && operation !== 'duplicate') throw new Error("Invalid operation");

        // TODO: Refactor the postOperations somehow?
        this.completedOperationProcess(cardEditorCardDto, operation);
      });
  }

  public shouldDeleteItems(cardFaceElementsPerCardFaceToDeleteIds: string[]): boolean {
    console.log(`%c${logInfo(this.constructor.name, this.shouldDeleteItems.name)}:\ncardFaceElementsPerCardFaceToDeleteIds:${stringify(cardFaceElementsPerCardFaceToDeleteIds)}}`, `color: #457b9d; background: #f1faee; padding: 5px; border-radius: 5px;`);

    return cardFaceElementsPerCardFaceToDeleteIds.length > 0;
  }

  // CHECKME: Break this function down into multiple parts?
  public processSaveCard(
    cardEditorFace: ElementRef,
    destroyRef: DestroyRef
  ): void {
    this.cardFaceLodsService.setCardFaceThumbnailImages$(cardEditorFace, destroyRef)
      .pipe(
        tap((fileMetadataLods: FileMetadata[] | undefined) => {
          console.log(`%c${logInfo(this.constructor.name, this.processSaveCard.name)} 1. Thumbnail images set`, `color: #344e41; background: #dad7cd; padding: 5px; border-radius: 5px;`)

          // CHECKME: Do we tap here?
          if (!fileMetadataLods) throw new Error(`${logInfo(this.constructor.name, this.processSaveCard.name)}: fileMetadataLods is undefined`);

          this.setFileMetadataLods(fileMetadataLods);
        }),
        // CHECKME: Do we actually want to delete the card face elements per card face here
        // TODO: Somehow figure out how you would actually do this in the backend in one call
        // Do we actually want to send the card editor card dto to the backend, grab all card face elements per card faces associated with the faces
        // Delete those, and just readd them? 
        switchMap((fileMetadataLods: FileMetadata[] | undefined) =>
          iif(
            () => this.shouldDeleteItems(
              this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds
            ),
            defer(() => this.cardFaceElementService.deleteCardFaceElementsPerCardFace$(
              this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds
            )),
            of(undefined)
          )
        ),

        tap(() => console.log(`%c${logInfo(this.constructor.name, this.processSaveCard.name)} 2. Delete operation completed`, `color: #450920; background: #f9dbbd; padding: 5px; border-radius: 5px;`)),
        switchMap(() => (this.updateCardEditorCardDto$(this.cardEditorPreviewService.cardEditorCardDto))),

        tap(() => console.log(`%c${logInfo(this.constructor.name, this.processSaveCard.name)} 3. Update operation completed`, `color: #590d22; background: #fff0f3; padding: 5px; border-radius: 5px;`)),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
        console.log(`%c${logInfo(this.constructor.name, this.processSaveCard.name)}:\ncardFaceElementsPerCardFaceToDeleteIds:\n${stringify(this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds)}\ncardEditorCardDto:\n${stringify(cardEditorCardDto)}`, `color: #5D414D; background: #E5F6C6; padding: 5px; border-radius: 5px;`);

        if (cardEditorCardDto) {
          // CHECKME: We need to update the card editor card dto inside of cardEditorPreviewService here
          this.completedOperationProcess(cardEditorCardDto, 'update');
        }
      });
  }

  /*************** COMPLETED  *******************/
  public subscribeToCompletedOperations(completedOperationsHandlers: Map<string, Function>, destroyRef: DestroyRef): void {
    this.cardEditorOperationsService.completedOperationSubscription(completedOperationsHandlers, destroyRef);
  }

  public completedOperationProcess(cardEditorCardDto: CardEditorCardDto, operation: 'create' | 'duplicate' | 'update'): void {
    let color: string = '', background: string = '';

    this.cardEditorPreviewService.setCardEditorCardDto(cardEditorCardDto);

    switch (operation) {
      case 'create': {
        this.completedCreateCardEditorCardDto(cardEditorCardDto);
        color = '#7D6E83', background = '#F8EDE3';
        break;
      }
      case 'duplicate': {
        this.completedDuplicateCardEditorCardDto(cardEditorCardDto);
        color = '#87805E', background = '#EDDFB3';
        break;
      }
      case 'update': {
        this.completedUpdateCardEditorCardDto(cardEditorCardDto);
        color = '#798777', background = '#F8EDE3';
        break;
      }
    }

    console.log(
      `%c${logInfo(this.constructor.name, this.completedOperationProcess.name)} - ${operation}\nCard editor card dto:\n${stringify(cardEditorCardDto)}`,
      `color: ${color}; background: ${background}; padding: 5px; border-radius: 5px;`
    );
  }

  // NOTE: Why this.cardEditorCardDto?
  // ASSUMPTION: We are updating the card editor card dto for the CARD EDITOR
  // TODO: Rework this to be in cardEditorPreviewService?
  private completedCreateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.fileMetadataService.orphan();

    this.cardEditorOperationsService.createdCardEditorCardDto(cardEditorCardDto);

    // We don't want to clear the items to be deleted because it's possible that we're updating the card instead of duplicating it
    // So that's why it gets cleared when we switch the card instead
  }

  private completedDuplicateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    // NOTE: Because of how this works, we want to orphan the file metadata first
    // There's a check that if the files aren't orphaned in orphanedFileMetadata, you can't clear it
    this.completedCreateCardEditorCardDto(cardEditorCardDto);

    // Because we're making a duplicate, you don't want to store the card face elements to delete, only do it for saving
    // We also want to set the to be oprhaned metadata to be nothing, since we're starting with a newly duplicated card
    this.cardEditorOperationsService.clear();
  }

  // TODO: Rework this to be in cardEditorPreviewService?
  private completedUpdateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.fileMetadataService.orphan();

    this.cardEditorOperationsService.updatedCardEditorCardDto(cardEditorCardDto);

    // CHECKME: Do we want to call it here?
    // This should theoretically be fine because we mark the file metadata as orphaned beforehand
    this.cardEditorOperationsService.clear();
  }

  /**************** FLIP *********************/
  // TODO: God do I need to rename things
  public triggerFlip(): void {
    this.cardEditorOperationsService.activateFlip();
  }

  public subscribeToFlip(processFlipOperations: Map<string, Function>, destroyRef: DestroyRef): void {
    this.cardEditorOperationsService.processFlipSubscription(processFlipOperations, destroyRef);
  }

  public activateFlip(
    cardEditorFace: ElementRef,
    destroyRef: DestroyRef
  ): void {
    console.log(`%c${logInfo(this.constructor.name, this.activateFlip.name)} (before)`, `color: #22577a; background: #c7f9cc; padding: 5px; border-radius: 5px;`);

    this.cardFaceLodsService.setCardFaceThumbnailImages$(cardEditorFace, destroyRef)
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((fileMetadataLods: FileMetadata[] | undefined) => {
        if (!fileMetadataLods) throw new Error(`${logInfo(this.constructor.name, this.activateFlip.name)}: fileMetadataLods is undefined`);

        this.setFileMetadataLods(fileMetadataLods);

        this.cardEditorOperationsService.completedFlip();
      });
  }

  public completedFlip(): void {
    this.toggleCurrentCardFace();
  }

  /**************************************/

  /*********** DELETE CARD **************/
  public canDeleteCard(cardId: string): boolean {
    if (!cardId) return false;

    return !(this.getCurrentCardId() === cardId);
  }

  public deleteCard(cardId: string): void {
    console.log(`%c${logInfo(this.constructor.name, this.deleteCard.name)}:\ncardId: ${cardId}`, `color: #4a5759; background: #edafb8; padding: 5px; border-radius: 5px;`);

    if (!this.canDeleteCard(cardId)) {
      throw new Error("Can't delete card as it's being edited or it's being undefined");
    }

    this.cardEditorCardDtoApiService.deleteCardEditorCardDtoByCardId$(cardId)
      .subscribe(() => {
        this.cardEditorOperationsService.deletedCardEditorCardDto(cardId);
      });
  }

  /************** TAGS ***************/
  public populateTags(): TagData[] {
    console.log(`%c${logInfo(this.constructor.name, this.populateTags.name)}: ${stringify(this.getCardTagNames())}`, 'color: #56021F; background: #F4CCE9; padding: 5px; border-radius: 5px;');

    return this.cardEditorTagService.populateTags(this.getCardTagNames());
  }

  /************** TEMPLATES *****************/
  public getCardTemplates(cardTemplates: Card[]): void {
    this.cardTemplateService.getCardTemplates(this.getCurrentOwnerId(), cardTemplates);
  }

  public addCardTemplate(cardEditorCardDto: CardEditorCardDto, cardTemplates: Card[]): void {
    if (!this.cardTemplateService.addCardTemplate(cardEditorCardDto, cardTemplates)) console.error("Isn't a card template but attempted to add it as one");
  }

  public updateCardTemplate(cardEditorCardDto: CardEditorCardDto, cardTemplates: Card[]): Card[] {
    let index: number = cardTemplates.findIndex(card => card.cardId === cardEditorCardDto.card.cardId);
    if (index !== -1) {
      let hasRemovedCardTemplateObj: {
        hasRemoved: boolean,
        cardTemplates: Card[]
      } = this.hasRemovedCardTemplate(cardEditorCardDto, cardTemplates);

      if (hasRemovedCardTemplateObj.hasRemoved) return hasRemovedCardTemplateObj.cardTemplates;

      cardTemplates[index] = { ...cardEditorCardDto.card };
      return cardTemplates;
    }

    if (!this.cardTemplateService.addCardTemplate(cardEditorCardDto, cardTemplates)) console.error("Isn't a card template but attempted to add it as one");
    return cardTemplates;
  }

  public removeCardTemplate(cardId: string, cardTemplates: Card[]): Card[] {
    return this.cardTemplateService.removeCardTemplate(cardId, cardTemplates);
  }

  private hasRemovedCardTemplate(cardEditorCardDto: CardEditorCardDto, cardTemplates: Card[]): {
    hasRemoved: boolean,
    cardTemplates: Card[]
  } {
    let { card } = cardEditorCardDto;

    let ct: Card[] = this.cardTemplateService.removeCardTemplate(cardEditorCardDto, cardTemplates);

    return {
      hasRemoved: !ct.some((c: Card) => c.cardId === card.cardId),
      cardTemplates: ct
    };
  }

  /********************************************/

  /********************************************/

  public isCardFaceElementsLibraryDisabled(): boolean {
    return !this.cardFaceElementService.canAddCardFaceElementPerCardFace(this.getCardFaceElementsPerCardFaceAmt());
  }

  public createdCardFaceElementPerCardFace(info: { type: string, dndPosition: DndPosition }, cardFaceClientRect: DOMRect): string {
    let { type, dndPosition } = info;

    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.cardFaceElementService.createCardFaceElementPerCardFace(
      {
        absolute: {
          x: dndPosition.x,
          y: dndPosition.y
        },
        rect: cardFaceClientRect
      },
      type,
      this.getCurrentCardFaceElementsPerCardFace()
    );

    if (!cardFaceElementPerCardFace) return '';

    let { cardFaceElement, cardFaceElementPerCardFaceId } = cardFaceElementPerCardFace;

    this.setElementIdentifiers({
      cardFaceElementId: cardFaceElement.cardFaceElementId,
      cardFaceElementType: cardFaceElement.cardFaceElementType,
      cardFaceElementZIndex: cardFaceElement.style?.zIndex ?? 'inherit',
      cardFaceElementPerCardFaceId
    });

    this.setElementPosition(
      {
        x: cardFaceElementPerCardFace.dndPosition.x,
        y: cardFaceElementPerCardFace.dndPosition.y
      },
      cardFaceElement.cardFaceElementId
    );

    this.enableElement(cardFaceElement.cardFaceElementId, type);

    return cardFaceElement.cardFaceElementId;
  }

  public deletedCardFaceElementPerCardFace(emitted: string): void {
    this.setCurrentCardFaceElementsPerCardFace(this.cardFaceElementService.deleteCardFaceElementPerFace(emitted, this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace()));

    if (!this.cardEditorPreviewService.isNewCardEditorCardDto() && this.cardFaceElementService.doesCardFaceElementPerCardFaceToDeleteExistInDatabase(emitted)) this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds.push(emitted);
  }

  /*************** FILE METADATA ***********************/
  public setFileMetadataLods(fileMetadataLods: FileMetadata[]): void {
    let idx: number = this.cardEditorPreviewService.getCurrentCardFaceIndex();

    this.cardFaceLodsService.orphanCardFaceLods(this.cardEditorPreviewService.cardEditorCardDto.cardEditorCardFacesDto[idx].fileMetadataLods);
    this.cardEditorPreviewService.cardEditorCardDto.cardEditorCardFacesDto[idx].fileMetadataLods = fileMetadataLods;

    console.log(`%c${logInfo(this.constructor.name, this.setFileMetadataLods.name)}: fileMetadataLods - \n${stringify(this.cardEditorPreviewService.cardEditorCardDto.cardEditorCardFacesDto[idx].fileMetadataLods)}`, 'color: #710627; background: #4D6CFA; padding: 5px; border-radius: 5px;');
  }

  /*********** CONTROLS ****************/
  public areBorderDimensionsEqual(borderDimensions: BorderDimensions): boolean {
    let { borderWidth } = borderDimensions;

    let {
      top,
      bottom,
      left,
      right
    } = borderDimensions.borderRect;

    return (
      borderWidth === top &&
      borderWidth === bottom &&
      borderWidth === left &&
      borderWidth === right
    );
  }

  public setLayer(cardFaceElementId: string, operation: 'front' | 'back' | 'forward' | 'backward'): void {
    this.cardFaceElementService.setLayer(cardFaceElementId, this.getCurrentCardFaceElementsPerCardFace(), operation);

    this.setElementsZIndexes(this.getCurrentCardFaceElementsPerCardFace());
  }

  /*************** ELEMENTS **************/
  public enableElement(cardFaceElementId: string, type: string): void {
    switch (type) {
      case 'Rt':
        this.enableRte(cardFaceElementId);
        break;
      case 'Image':
        this.focusImage();
        break;
    }
  }

  public setElementPosition(
    coordinates: Coordinates,
    cardFaceElementId: string
  ): void {
    this.cardFaceElementService.setCardFaceElementPosition(
      coordinates,
      this.getCardFaceElementPerCardFace(
        cardFaceElementId,
        this.getCurrentCardFaceElementsPerCardFace()
      )
    );

    this.$currentCardFaceElementPositions.update((currentCardFaceElementPositions: Map<string, Coordinates>) => new Map<string, Coordinates>(currentCardFaceElementPositions).set(cardFaceElementId, coordinates));
  }

  public setElementDimensions(
    dimensions: Dimensions,
    cardFaceElementId: string
  ): void {
    this.cardFaceElementService.setCardFaceElementDimensions(
      dimensions,
      this.getCardFaceElementPerCardFace(
        cardFaceElementId,
        this.getCurrentCardFaceElementsPerCardFace()
      )
    );

    this.$currentCardFaceElementDimensions.update(($currentCardFaceElementDimensions: Map<string, Dimensions>) => new Map<string, Dimensions>($currentCardFaceElementDimensions).set(cardFaceElementId, dimensions));
  }

  public setElementsAttributes(destroyRef: DestroyRef): void {
    let currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = this.getCurrentCardFaceElementsPerCardFace();

    this.setElementsIdentifiers(currentCardFaceElementsPerCardFace);

    this.setElementsDimensions(currentCardFaceElementsPerCardFace);

    this.setElementsPositions(currentCardFaceElementsPerCardFace);

    this.setElementsRts(currentCardFaceElementsPerCardFace);

    this.setElementsImages(currentCardFaceElementsPerCardFace, destroyRef);
  }

  public setElementIdentifiers(
    identifiers: {
      cardFaceElementId: string,
      cardFaceElementType: 'Rt' | 'Image',
      cardFaceElementZIndex: string,
      cardFaceElementPerCardFaceId: string // TODO: Take this out
    }
  ): void {
    this.$currentCardFaceElementIdentifiers.update((currentCardFaceElementIdentifiers: {
      cardFaceElementId: string,
      cardFaceElementType: 'Rt' | 'Image',
      cardFaceElementZIndex: string,
      cardFaceElementPerCardFaceId: string // TODO: Take this out
    }[]) => [...currentCardFaceElementIdentifiers, identifiers]);
  }

  // CHECKME: Modify this to be more optimal
  public setElementsIdentifiers(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    if (!currentCardFaceElementsPerCardFace) {
      this.$currentCardFaceElementIdentifiers.set([]);
      return;
    }

    this.$currentCardFaceElementIdentifiers.set(
      currentCardFaceElementsPerCardFace
        .map((value: CardFaceElementPerCardFace) => {
          return {
            cardFaceElementId: value.cardFaceElement.cardFaceElementId,
            cardFaceElementType: value.cardFaceElement.cardFaceElementType,
            cardFaceElementZIndex: value.cardFaceElement.style?.zIndex ?? 'inherit',
            cardFaceElementPerCardFaceId: value.cardFaceElementPerCardFaceId
          }
        }
        )
    );

    console.log(`%c${logInfo(this.constructor.name, this.setElementsIdentifiers.name)}: currentCardFaceElementsPerCardFaceIdentifiers:\n${(stringify(Array.from(this.$currentCardFaceElementIdentifiers().entries())))}`, 'color: #86A397; background: #E5BE9E; padding: 5px; border-radius: 5px;');
  }

  public setElementsZIndexes(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
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
        let zIndex: string = this.getCardFaceElementPerCardFace(identifier.cardFaceElementId, currentCardFaceElementsPerCardFace).cardFaceElement.style?.zIndex ?? 'inherit';
        return { ...identifier, cardFaceElementZIndex: zIndex };
      })
    });

    console.log(`%c${logInfo(this.constructor.name, this.setElementsZIndexes.name)}: currentCardFaceElementsPerCardFaceIdentifiers:\n${(stringify(Array.from(this.$currentCardFaceElementIdentifiers().entries())))}`, 'color: #5400c2; background: #a17174; padding: 5px; border-radius: 5px;');
  }

  // CHECKME: Modify this to be more optimal
  public setElementsDimensions(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    this.$currentCardFaceElementDimensions.update(() => {
      let updated: Map<string, Dimensions> = new Map<string, Dimensions>();

      if (!currentCardFaceElementsPerCardFace) return updated;

      currentCardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) => {
        updated.set(value.cardFaceElement.cardFaceElementId, this.cardFaceElementService.getCardFaceElementDimensions(value.cardFaceElement));
      });

      return updated;
    });

    console.log(`%c${logInfo(this.constructor.name, this.setElementsDimensions.name)} - currentCardFaceElementsPerCardFaceDimensions: ${stringify(this.$currentCardFaceElementDimensions())}`, `color: #253C78; background: #FFEECF; padding: 5px; border-radius: 5px;`);
  }

  // CHECKME: Modify this to be more optimal
  public setElementsPositions(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    this.$currentCardFaceElementPositions.update(() => {
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

    console.log(`%c${logInfo(this.constructor.name, this.setElementsPositions.name)} - currentCardFaceElementsPerCardFacePositions: ${stringify(this.$currentCardFaceElementPositions())}`, `color: #0471A6; background: #89AAE6; padding: 5px; border-radius: 5px;`);
  }

  public enableRte(cardFaceElementId: string): void {
    this.disableImageEditor();

    this.setElementRt(cardFaceElementId, this.cardFaceElementRtService.getRt(cardFaceElementId, this.getCurrentCardFaceElementsPerCardFace()));

    this.cardFaceElementRteService.setOnEnableRte(cardFaceElementId, this.cardFaceElementRtService.getRt(cardFaceElementId, this.getCurrentCardFaceElementsPerCardFace()));
  }

  public rteTextChange(destroyRef: DestroyRef): void {
    this.cardFaceElementRteService.rteTextChange((text: string) => {
      this.setElementRt(this.$currentCardFaceElementId(), text);

      this.cardFaceElementRtService.setRt(this.$currentCardFaceElementId(), text, this.getCurrentCardFaceElementsPerCardFace());
    },
      destroyRef);
  }

  public disableRte(): void {
    if (!this.cardFaceElementRtService.isRt(this.$currentCardFaceElementId(), this.getCurrentCardFaceElementsPerCardFace())) return;

    this.cardFaceElementRteService.setOnDisableRte(this.$currentCardFaceElementId(), this.cardFaceElementRtService.getRt(this.$currentCardFaceElementId(), this.getCurrentCardFaceElementsPerCardFace()));
  }

  public setElementRt(cardFaceElementId: string, text: string): void {
    this.$currentCardFaceElementRts.update((currentCardFaceElementRts: Map<string, string>) => new Map<string, string>(currentCardFaceElementRts).set(cardFaceElementId, text));
  }

  // CHECKME: Modify this to be more optimal
  public setElementsRts(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    this.$currentCardFaceElementRts.update(() => {
      let updated: Map<string, string> = new Map<string, string>();

      if (!currentCardFaceElementsPerCardFace) return updated;

      currentCardFaceElementsPerCardFace.map((value: CardFaceElementPerCardFace) => {
        if (this.cardFaceElementRtService.isRt(value.cardFaceElement.cardFaceElementId, this.getCurrentCardFaceElementsPerCardFace()))
          updated.set(value.cardFaceElement.cardFaceElementId, this.cardFaceElementRtService.getRt(value.cardFaceElement.cardFaceElementId, currentCardFaceElementsPerCardFace));
      });

      return updated;
    });

    console.log(`%c${logInfo(this.constructor.name, this.setElementsRts.name)} - currentCardFaceElementsPerCardFaceRts: ${stringify(this.$currentCardFaceElementRts())}`, `color: #48435C; background: #61E786; padding: 5px; border-radius: 5px;`);
  }

  public imageEditorStatusToggle(imageEditorStatusOperations: Map<string, Function>, destroyRef: DestroyRef): void {
    this.cardFaceElementImageEditorService.statusToggleSubscription(imageEditorStatusOperations, destroyRef);
  }

  public focusImage(): void {
    this.disableRte();
  }

  public enableImageEditor(): void {
    this.focusImage();

    this.cardFaceElementImageModalService.displayCardFaceImageEditor();
  }

  public setElementImage(
    cardFaceElementId: string,
    url: string,
    cardFaceDimensions: Dimensions
  ): void {
    let img: HTMLImageElement = new Image();
    img.src = url;
    img.onload = () => {
      let dimensions: Dimensions ={width: img.naturalWidth, height: img.naturalHeight};

      // CHECKME
      this.setElementDimensions((dimensions > cardFaceDimensions) ? this.setProportionalDimensions(dimensions, cardFaceDimensions) : dimensions, cardFaceElementId);

      URL.revokeObjectURL(img.src);
    };

    this.$currentCardFaceElementImages.update((currentCardFaceElementImages: Map<string, string>) => new Map<string, string>(currentCardFaceElementImages).set(cardFaceElementId, url));
  }

  public setElementsImages(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[], destroyRef: DestroyRef): void {
    let cardFaceElementImagesPerCardFace: CardFaceElementPerCardFace[] = currentCardFaceElementsPerCardFace.filter((value: CardFaceElementPerCardFace) => (this.cardFaceElementImageService.isImage(value.cardFaceElement.cardFaceElementId, currentCardFaceElementsPerCardFace)));

    unsubscription(this.getAllImageSrcs$$);

    this.getAllImageSrcs$$ = this.cardFaceElementImageService.getAllImageSrcs$(cardFaceElementImagesPerCardFace, destroyRef)
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((results: {
        cardFaceElementId: string;
        htmlImageElementSrc: string;
      }[]) => {
        this.$currentCardFaceElementImages.set(this.setImageSrcs(results));
      }
      );
  }

  public setImageSrcs(results: {
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

  public uploadImage(src: string, destroyRef: DestroyRef): void {
    if (!src || !this.cardFaceElementImageService.isImage(this.$currentCardFaceElementId(), this.getCurrentCardFaceElementsPerCardFace())) return;

    this.setElementImage(this.$currentCardFaceElementId(), src, this.getCardFaceDimensions());

    let cardFaceElementImage: CardFaceElementImage = this.cardFaceElementImageService.getElement(
      this.$currentCardFaceElementId(),
      this.getCurrentCardFaceElementsPerCardFace()
    );

    this.cardFaceElementImageService.setSrc$(src, cardFaceElementImage, destroyRef)
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((cardFaceElementImageFileMetadata: FileMetadata | undefined) => {
        if (!cardFaceElementImageFileMetadata) throw new Error(`Set card face image element src:\nCard face element image file metadata: ${stringify(cardFaceElementImageFileMetadata)}\nImage file metadata${stringify(cardFaceElementImage.imageFileMetadata)}`);

        cardFaceElementImage.imageFileMetadata = cardFaceElementImageFileMetadata;

        console.log(`%c${logInfo(this.constructor.name, this.uploadImage.name)}: cardFaceElementImage: ${stringify(cardFaceElementImage)}`, `color: #082D0F; background: #17B890; padding: 5px; border-radius: 5px;`);
      }
    );

    this.disableImageEditor();
  }

  public disableImageEditor(): void {
    this.cardFaceElementImageModalService.closeCardFaceImageEditor();
  }

  public resetElementAttributes(
    $cardFaceElementWidth: ModelSignal<number>,
    $cardFaceElementHeight: ModelSignal<number>,
    $cardFaceElementX: ModelSignal<number>,
    $cardFaceElementY: ModelSignal<number>
  ): void {
    this.$currentCardFaceElementId.set(DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

    $cardFaceElementWidth.set(DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_WIDTH);
    $cardFaceElementHeight.set(DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_HEIGHT);

    $cardFaceElementX.set(DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_X);
    $cardFaceElementY.set(DEFAULT_CARD_FACE_ELEMENT_ATTRIBUTE_Y);
  }

  public setProportionalDimensions(original: Dimensions, dimensions: Dimensions): Dimensions {
    let scale: Dimensions = {
      width: dimensions.width / original.width,
      height: dimensions.height / original.height
    }

    let proportion: number = Math.min(scale.width, scale.height);
    
    return {
      width: original.width * proportion,
      height: original.height * proportion
    }
  }


  /******************* CARD FACE *********************/
  public setCardFaceColor(color: string, property: 'face' | 'edge'): void {
    let style: Style = this.getCurrentCardFaceStyle();

    this.cardFaceStyleService.setColor(color, style, property);

    this.setCurrentCardFaceStyle(style);
  }

  public setCardFaceBorderRadius(radius: number): void {
    let style: Style = this.getCurrentCardFaceStyle();

    this.cardFaceStyleService.setBorderRadius(radius, style);

    this.setCurrentCardFaceStyle(style);
  }

  public setCardFaceBorderDimensions(dimensions: BorderDimensions): void {
    let style: Style = this.getCurrentCardFaceStyle();

    this.cardFaceStyleService.setDimensions(dimensions, style);

    this.setCurrentCardFaceStyle(style);
  }

  public getCardFaceDimensions(): Dimensions {
    let style =this.getCardEditorFaceStyle();

    let {width, height} = style;

    if (!width || !height) return DEFAULT_CARD_FACE_DIMENSIONS;

    return {
      width: parseNumeric(width),
      height: parseNumeric(height)
    }
  }

  public setCardFaceDimensions(dimensions: Dimensions): void {
    let style: Style = this.getCurrentCardFaceStyle();

    this.cardFaceStyleService.setDimensions(dimensions, style);

    this.setCurrentCardFaceStyle(style);
  }
}
