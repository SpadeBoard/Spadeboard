import { DestroyRef, ElementRef, inject, Injectable } from '@angular/core';
import { logInfo } from '../../../../../../../utils/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardEditorPreviewService } from '../../../card-editor/preview/card-editor-preview.service';
import { CardEditorFacePreviewFileMetadataService } from '../file-metadata/card-editor-face-preview-file-metadata.service';
import { Style } from '../../../../../../style/models/style';
import { CardFaceLodsService } from '../../lods/card-face-lods.service';
import { CardEditorOperationsService } from '../../../card-editor/operations/card-editor-operations.service';
import { FileMetadata } from '../../../../../../../utils/models/file-metadata';
import { CardFaceEditorPreviewAttributesService } from '../attributes/card-face-editor-preview-attributes.service';
import { CardFaceEditorPreviewElementsService } from '../elements/card-face-editor-preview-elements.service';

@Injectable({
  providedIn: 'root',
})
export class CardEditorFacePreviewFlipService {
  private readonly cardEditorFacePreviewFileMetadataService: CardEditorFacePreviewFileMetadataService = inject(CardEditorFacePreviewFileMetadataService);

  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
  private readonly cardFaceLodsService: CardFaceLodsService = inject(CardFaceLodsService);
  
  private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);
  
  public onFlip(
    cardEditorFace: ElementRef,
    destroyRef: DestroyRef,
    currentCardFaceStyle: Style
  ): void {
    console.log(`%c${logInfo(this.constructor.name, this.onFlip.name)} (before)`, `color: #22577a; background: #c7f9cc; padding: 5px; border-radius: 5px;`);

    this.cardFaceLodsService.setCardFaceThumbnailImages$(cardEditorFace, destroyRef)
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((fileMetadataLods: FileMetadata[] | undefined) => {
        if (!fileMetadataLods) throw new Error(`${logInfo(this.constructor.name, this.onFlip.name)}: fileMetadataLods is undefined`);

        this.cardEditorPreviewService.setCurrentCardFaceStyle(currentCardFaceStyle);

        this.cardEditorFacePreviewFileMetadataService.setFileMetadataLods(fileMetadataLods, this.cardEditorPreviewService);

        this.cardEditorOperationsService.postFlip();
      });
  }

  public postFlip(
    cardFaceEditorPreviewAttributesSerivce: CardFaceEditorPreviewAttributesService,
    cardFaceEditorPreviewElementsService: CardFaceEditorPreviewElementsService,
    destroyRef: DestroyRef
  ): void {
    this.cardEditorPreviewService.toggleCurrentCardFace();

    cardFaceEditorPreviewAttributesSerivce.setCurrentCardFaceStyle(this.cardEditorPreviewService.getCurrentCardFaceStyle());

    cardFaceEditorPreviewElementsService.setCardFaceElementsPerCardFace(this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace(), destroyRef);
    cardFaceEditorPreviewElementsService.resetElementAttributes();
  }
}
