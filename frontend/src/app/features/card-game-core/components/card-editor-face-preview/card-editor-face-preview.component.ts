import { AfterViewInit, Component, DestroyRef, ElementRef, inject, input, InputSignal, ViewChild } from '@angular/core';
import { Style } from '../../../style/models/style';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { isCardFaceElementPerCardFace } from '../../utils/card-game-core.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { CardEditorCardFaceDto } from '../../models/card-face';
import html2canvas from 'html2canvas';
import { from, map, Observable, takeUntil } from 'rxjs';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardEditorCurrentCardFaceElementsPerCardFaceComponent } from '../card-editor-current-card-face-elements-per-card-face/card-editor-current-card-face-elements-per-card-face.component';
import { CommonModule } from '@angular/common';
import { filterAgainstNull } from '../../../style/utils/get-style';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-card-editor-face-preview',
  imports: [CdkDrag, CdkDragHandle, DragDropModule, CardEditorCurrentCardFaceElementsPerCardFaceComponent, CommonModule],
  templateUrl: './card-editor-face-preview.component.html',
  styleUrl: './card-editor-face-preview.component.css'
})
export class CardEditorFacePreviewComponent implements AfterViewInit {
  private cardEditorPreviewService: CardEditorPreviewService  = inject(CardEditorPreviewService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  
  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;
  @ViewChild("cardFaceElementsPerCardFace") cardFaceElementsPerCardFace!: CardEditorCurrentCardFaceElementsPerCardFaceComponent;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log(`After view init cef preview component: ${JSON.stringify(this.cardEditorFace.nativeElement)}`);
  
    this.onFlip();
    this.getCardEditorFaceStyle();
  }

  getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    let { styleId, ...rest } = this.cardEditorPreviewService.getCurrentCardFace().style;

    let filtered = filterAgainstNull(rest);

    return filtered;
  }

  // TODO: If style of card face is passed in, get the aspect ratio and set the card editor face style
  setCardEditorFaceStyle(style?: Style): void {
    let placeholder: Style = this.cardEditorPreviewService.defaultCardEditorFaceStyle;

    if (style) {
      placeholder = style;
    }
 
    this.updateCurrentCardEditorCardFaceDto(placeholder);
  }

  updateCurrentCardEditorCardFaceDto(currentCardFaceStyle: Style) {
    this.cardEditorPreviewService.updateCurrentCardFaceStyle(currentCardFaceStyle);
    this.cardEditorPreviewService.updateCardEditorCardFaceDto();
  }


  private flattenCardFaceToImage(cardEditorFace: ElementRef<any>): Promise<FormData> {
    return new Promise((resolve, reject) => {
      // TODO: Pass in the ref and scale as parameters
      html2canvas(cardEditorFace.nativeElement, {
        scale: 0.45
      })
        .then((canvas: any) => {
          canvas.toBlob((blob: Blob | null) => {
            if (!blob /*|| cardFace === undefined || cardFace?.cardFaceThumbnailFilePath === undefined*/) {
              reject(new Error('Canvas blob is null'));
              return;
            }

            let formData = new FormData();
            
            formData.append('formFile', blob);
            // console.log(cardFaceFileName);
            // console.log(`Form data: ${JSON.stringify(formData.values)}`);

            resolve(formData);
          }, 'image/jpg', 0.8);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  updateCardEditorCardFaceDto() {
    this.updateCardFaceImages$(this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((images: FormData[]) => {
      if (images.length <= 0)
        return;

      this.cardFaceElementsPerCardFace.setCurrentCardFaceElementsPerCardFace();
      this.cardEditorPreviewService.updateCardEditorCardFaceDto();
    })
  }

  private onFlip() {
    this.cardEditorPreviewService.onFlip$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateCardEditorCardFaceDto();

        this.cardEditorPreviewService.onFlipCurrentCardFace();

        this.cardFaceElementsPerCardFace.getCurrentCardFaceElementsPerCardFace();
      });
  }

  updateCardFaceImagesForCurrentCardFace() {
    this.updateCardFaceImages$(this.cardEditorPreviewService.getCurrentCardFaceIndex())
    .pipe(takeUntilDestroyed(this.destroyRef));
  }

  private updateCardFaceImages$(cardFaceIndexToTakeImageOf: number): Observable<FormData[]> {
    return from(this.flattenCardFaceToImage(this.cardEditorFace)).pipe(
      map((value: FormData) => {
        this.cardEditorPreviewService.cardFaceImages [cardFaceIndexToTakeImageOf] = value;
        return this.cardEditorPreviewService.cardFaceImages;
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  createCard() {
    this.updateCardFaceImages$(this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((images: FormData[]) => {
     if (!this.handleUpdateCardFaceImages(images.length))
        return;

      this.cardEditorPreviewService.createCard();
    });
  }

  saveCard() {
    this.updateCardFaceImages$(this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((images: FormData[]) => {
      if (!this.handleUpdateCardFaceImages(images.length))
        return;

      this.cardEditorPreviewService.updateCard();
    });
  }

  handleUpdateCardFaceImages(imagesLength: number): boolean
  {
    if (imagesLength <= 0) {
      return false;
    }

    this.cardFaceElementsPerCardFace.setCurrentCardFaceElementsPerCardFace(); 
    this.cardEditorPreviewService.updateCardEditorCardFaceDto();
    return true;
  }
}
