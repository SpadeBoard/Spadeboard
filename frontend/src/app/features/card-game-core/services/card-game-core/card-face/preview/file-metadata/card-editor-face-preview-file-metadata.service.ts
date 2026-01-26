import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardFaceLodsService } from '../../lods/card-face-lods.service';
import { CardFaceElementService } from '../../../card-face-element/card-face-element.service';
import { CardEditorApiService } from '../../../card-editor/api/card-editor-api.service';
import { CardFaceElementImageService } from '../../../card-face-element/images/card-face-element-image.service';
import { FileMetadataService } from '../../../../../../../utils/services/file/metadata/facade/file-metadata.service';
import { FileMetadata } from '../../../../../../../utils/models/file-metadata';
import { logInfo, stringify } from '../../../../../../../utils/utils';
import { CardEditorPreviewService } from '../../../card-editor/preview/card-editor-preview.service';

@Injectable({
  providedIn: 'root',
})
export class CardEditorFacePreviewFileMetadataService {
  private readonly fileMetadataService: FileMetadataService = inject(FileMetadataService);

  private readonly cardFaceLodsService: CardFaceLodsService = inject(CardFaceLodsService);

  private readonly cardFaceElementService: CardFaceElementService = inject(CardFaceElementService);

  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);

  private readonly cardFaceElementImageService: CardFaceElementImageService = inject(CardFaceElementImageService);

  public setFileMetadataLods(fileMetadataLods: FileMetadata[], cardEditorPreviewService: CardEditorPreviewService): void {
    let idx: number = cardEditorPreviewService.getCurrentCardFaceIndex();

    this.cardFaceLodsService.orphanCardFaceLods(cardEditorPreviewService.cardEditorCardDto.cardEditorCardFacesDto[idx].fileMetadataLods);
    cardEditorPreviewService.cardEditorCardDto.cardEditorCardFacesDto[idx].fileMetadataLods = fileMetadataLods;

    console.log(`%c${logInfo(this.constructor.name, this.setFileMetadataLods.name)}: fileMetadataLods - \n${stringify(cardEditorPreviewService.cardEditorCardDto.cardEditorCardFacesDto[idx].fileMetadataLods)}`, 'color: #710627; background: #4D6CFA; padding: 5px; border-radius: 5px;');
  }

  public orphanFileMetadata(destroyRef: DestroyRef): void {
    this.fileMetadataService.orphan$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        this.cardFaceLodsService.orphanFileMetadata();
        this.cardFaceElementImageService.orphanFileMetadata();
      })
  }

  // CHECKME: Is this being used correctly
  public clearOrphanedFileMetadata(destroyRef: DestroyRef): void {
    this.cardEditorApiService.clear$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        this.cardFaceLodsService.clear();
        this.cardFaceElementImageService.clear();
        this.cardFaceElementService.clear(); // CHECKME: Do we clear here?
      });
  }
}
