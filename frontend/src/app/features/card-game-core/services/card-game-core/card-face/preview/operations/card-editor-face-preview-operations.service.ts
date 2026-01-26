import { DestroyRef, ElementRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, iif, map, Observable, of, switchMap, tap } from 'rxjs';
import { FileMetadata } from '../../../../../../../utils/models/file-metadata';
import { logInfo, stringify } from '../../../../../../../utils/utils';
import { DndPosition } from '../../../../../../drag-and-drop/models/dnd-types';
import { CardEditorCardDto } from '../../../../../models/card';
import { CardFaceElementPerCardFace } from '../../../../../models/card-face-element';
import { CardEditorOperationsService } from '../../../card-editor/operations/card-editor-operations.service';
import { CardEditorPreviewService } from '../../../card-editor/preview/card-editor-preview.service';
import { CardFaceElementService } from '../../../card-face-element/card-face-element.service';
import { CardFaceElementImageService } from '../../../card-face-element/images/card-face-element-image.service';
import { CardFaceLodsService } from '../../lods/card-face-lods.service';
import { CardFaceEditorPreviewAttributesService } from '../attributes/card-face-editor-preview-attributes.service';
import { CardFaceEditorPreviewElementsService } from '../elements/card-face-editor-preview-elements.service';
import { CardEditorFacePreviewFileMetadataService } from '../file-metadata/card-editor-face-preview-file-metadata.service';

@Injectable({
  providedIn: 'root',
})
export class CardEditorFacePreviewOperationsService {
  private readonly cardFaceLodsService: CardFaceLodsService = inject(CardFaceLodsService);

  private readonly cardEditorFacePreviewFileMetadataService: CardEditorFacePreviewFileMetadataService = inject(CardEditorFacePreviewFileMetadataService);

  private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);

  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardFaceElementService: CardFaceElementService = inject(CardFaceElementService);

  private readonly cardFaceElementImageService: CardFaceElementImageService = inject(CardFaceElementImageService);

  public cardEditorFacePreviewOperations: Map<string, Function> = new Map<string, Function>([
      ['create', (
        args: {
            cardEditorFace: ElementRef,
            cardFaceEditorPreviewAttributesService: CardFaceEditorPreviewAttributesService,
            destroyRef: DestroyRef
          }
      ) => {
        this.cardEditorPreviewService.setCurrentCardFaceStyle(args.cardFaceEditorPreviewAttributesService.getCurrentCardFaceStyle());
        this.createCard(args.cardEditorFace, this.duplicateCardObservables$(this.cardEditorPreviewService.cardEditorCardDto, args.destroyRef), args.destroyRef)
      }],
      ['save', (
        args: {
            cardEditorFace: ElementRef,
            cardFaceEditorPreviewAttributesService: CardFaceEditorPreviewAttributesService,
            destroyRef: DestroyRef
          }
      ) => {
        this.cardEditorPreviewService.setCurrentCardFaceStyle(args.cardFaceEditorPreviewAttributesService.getCurrentCardFaceStyle());
        this.saveCard(args.cardEditorFace, args.destroyRef);
      }]
    ]);

  /***************************/

  public duplicateCardObservables$(cardEditorCardDto: CardEditorCardDto, destroyRef: DestroyRef): Array<Observable<any>> {
    return [
      this.cardFaceElementImageService.duplicateCardFaceElementImages$(cardEditorCardDto, destroyRef),
      this.cardFaceLodsService.duplicateCardFaceThumbnails$(cardEditorCardDto, destroyRef),
    ];
  }

  public createCard(cardEditorFace: ElementRef, duplicateCardObservables$: Array<Observable<any>>, destroyRef: DestroyRef): void {
    this.cardFaceLodsService.setCardFaceThumbnailImages$(cardEditorFace, destroyRef)
      .pipe(
        switchMap((fileMetadataLods: FileMetadata[] | undefined) => {
          if (!fileMetadataLods) throw new Error(`${logInfo(this.constructor.name, this.createCard.name)}: fileMetadataLods is undefined`);

          this.cardEditorFacePreviewFileMetadataService.setFileMetadataLods(fileMetadataLods, this.cardEditorPreviewService);

          if (this.cardEditorPreviewService.isNewCardEditorCardDto()) {
            return this.cardEditorOperationsService.createCardEditorCardDto$(this.cardEditorPreviewService.cardEditorCardDto).pipe(
              map(cardEditorCardDto => ({
                operation: 'create',
                cardEditorCardDto
              }))
            );
          } else {
            return this.cardEditorOperationsService.duplicateCardEditorCardDto$(this.cardEditorPreviewService.cardEditorCardDto, duplicateCardObservables$).pipe(
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
        if (!cardEditorCardDto) throw new Error(`${logInfo(this.constructor.name, this.createCard.name)}: No card editor card dto`);

        if (operation !== 'create' && operation !== 'duplicate') throw new Error("Invalid operation");

        // TODO: Refactor the postOperations somehow?
        this.cardEditorPreviewService.postApiOperations(cardEditorCardDto, operation);
      });
  }

  public shouldDeleteItems(cardFaceElementsPerCardFaceToDeleteIds: string[]): boolean {
    console.log(`%c${logInfo(this.constructor.name, this.shouldDeleteItems.name)}:\ncardFaceElementsPerCardFaceToDeleteIds:${stringify(cardFaceElementsPerCardFaceToDeleteIds)}}`, `color: #457b9d; background: #f1faee; padding: 5px; border-radius: 5px;`);

    return cardFaceElementsPerCardFaceToDeleteIds.length > 0;
  }

  // CHECKME: Break this function down into multiple parts?
  public saveCard(cardEditorFace: ElementRef, destroyRef: DestroyRef): void {
    this.cardFaceLodsService.setCardFaceThumbnailImages$(cardEditorFace, destroyRef)
      .pipe(
        tap((fileMetadataLods: FileMetadata[] | undefined) => {
          console.log(`%c${logInfo(this.constructor.name, this.saveCard.name)} 1. Thumbnail images set`, `color: #344e41; background: #dad7cd; padding: 5px; border-radius: 5px;`)

          // CHECKME: Do we tap here?
          if (!fileMetadataLods) throw new Error(`${logInfo(this.constructor.name, this.saveCard.name)}: fileMetadataLods is undefined`);

          this.cardEditorFacePreviewFileMetadataService.setFileMetadataLods(fileMetadataLods, this.cardEditorPreviewService);
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

        tap(() => console.log(`%c${logInfo(this.constructor.name, this.saveCard.name)} 2. Delete operation completed`, `color: #450920; background: #f9dbbd; padding: 5px; border-radius: 5px;`)),
        switchMap(() => (this.cardEditorOperationsService.updateCardEditorCardDto$(this.cardEditorPreviewService.cardEditorCardDto))),

        tap(() => console.log(`%c${logInfo(this.constructor.name, this.saveCard.name)} 3. Update operation completed`, `color: #590d22; background: #fff0f3; padding: 5px; border-radius: 5px;`)),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
        console.log(`%c${logInfo(this.constructor.name, this.saveCard.name)}:\ncardFaceElementsPerCardFaceToDeleteIds:\n${stringify(this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds)}\ncardEditorCardDto:\n${stringify(cardEditorCardDto)}`, `color: #5D414D; background: #E5F6C6; padding: 5px; border-radius: 5px;`);

        if (cardEditorCardDto) {
          // CHECKME: We need to update the card editor card dto inside of cardEditorPreviewService here
          this.cardEditorPreviewService.postApiOperations(cardEditorCardDto, 'update');
        }
      });
  }

  /*****************************************/

  // TODO: Call this whenever signal is emitted from child, and child will emit and pass back the rect
    // TODO: Modify this to just handle the this.cardFaceElementService.createdCardFaceElementPerCardFace$
    public createdCardFaceElementPerCardFace(
      emitted: { type: string, dndPosition: DndPosition},
      cardFaceEditorPreviewElementsService: CardFaceEditorPreviewElementsService,
      cardFaceClientRect: DOMRect,
      destroyRef: DestroyRef
    ): void {
      let { type, dndPosition } = emitted;
  
      // TODO: Make a shallow copy of $currentCardFaceElementsPerCardFace and then add to it and do it back?
  
      // Ok, so this is for the local update
      let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.cardFaceElementService.createCardFaceElementPerCardFace(
        {
          absolute: {
            x: dndPosition.x,
            y: dndPosition.y
          },
          rect: cardFaceClientRect
        },
        type,
        cardFaceEditorPreviewElementsService.$currentCardFaceElementsPerCardFace()
      );
  
      if (!cardFaceElementPerCardFace) return;
  
      // FIXED: This should work
      // CHECKME: Make sure it doesn't affect everything else
      this.cardEditorPreviewService.setCurrentCardFaceElementsPerCardFace(cardFaceEditorPreviewElementsService.$currentCardFaceElementsPerCardFace());
      // cardFaceEditorPreviewElementsService.setCardFaceElementsPerCardFace(cardFaceEditorPreviewElementsService.$currentCardFaceElementsPerCardFace());
  
      /*** POTENTIALLY MOVE THIS OUT ****/
      let { cardFaceElement, cardFaceElementPerCardFaceId } = cardFaceElementPerCardFace;
  
      cardFaceEditorPreviewElementsService.setCardFaceElementIdentifiers(
        cardFaceEditorPreviewElementsService.$currentCardFaceElementIdentifiers,
        {
          cardFaceElementId: cardFaceElement.cardFaceElementId,
          cardFaceElementType: cardFaceElement.cardFaceElementType,
          cardFaceElementZIndex: cardFaceElement.style?.zIndex ?? 'inherit',
          cardFaceElementPerCardFaceId
        }
      );
  
      cardFaceEditorPreviewElementsService.setCardFaceElementPosition(
        cardFaceEditorPreviewElementsService.$currentCardFaceElementPositions,
        cardFaceElement.cardFaceElementId, {
        x: cardFaceElementPerCardFace.dndPosition.x,
        y: cardFaceElementPerCardFace.dndPosition.y
      });
  
      cardFaceEditorPreviewElementsService.enableElement(cardFaceElement.cardFaceElementId, type, destroyRef);
      /***********************/
  
      console.log(`%c${logInfo(this.constructor.name, this.createdCardFaceElementPerCardFace.name)}:\nCard face elements per card face:${stringify(cardFaceEditorPreviewElementsService.$currentCardFaceElementsPerCardFace())}\nCard editor card dto:\n${stringify(this.cardEditorPreviewService.cardEditorCardDto)}`, `color: #19183B; background: #E7F2EF; padding: 5px; border-radius: 5px;`);
  
      // ASSUMPTION: The latest card face element per card face will always be the last of the index
      // this.clampNewCardFaceElementPerCardFacePosition();
    }

    public deletedCardFaceElementPerCardFace(
      emitted: string,
      cardFaceEditorPreviewElementsService: CardFaceEditorPreviewElementsService,
      destroyRef: DestroyRef
    ): void {
    this.cardEditorPreviewService.setCurrentCardFaceElementsPerCardFace(this.cardFaceElementService.deleteCardFaceElementPerFace(emitted, this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace()));
    if (!this.cardEditorPreviewService.isNewCardEditorCardDto() && this.cardFaceElementService.doesCardFaceElementPerCardFaceToDeleteExistInDatabase(emitted)) this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds.push(emitted);

    cardFaceEditorPreviewElementsService.setCardFaceElementsPerCardFace(this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace(), destroyRef);

    cardFaceEditorPreviewElementsService.resetElementAttributes();

    console.log(`
        %c${logInfo(this.constructor.name, this.deletedCardFaceElementPerCardFace.name)}:\nCard face element per face ID: ${emitted}
        \n${stringify(this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds)}
      `, 'color: #f95401; background: #fffdf3; padding: 5px; border-radius: 5px;');

    // CHECKME: Do we call a subject here like in the original code for this?
  }
}
