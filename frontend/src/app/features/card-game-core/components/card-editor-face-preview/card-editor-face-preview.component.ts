import { AfterViewInit, Component, DestroyRef, ElementRef, inject, input, InputSignal, ViewChild } from '@angular/core';
import { BorderDimensions, Style } from '../../../style/models/style';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { isCardFaceElementPerCardFace } from '../../utils/card-game-core.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { CardEditorCardFaceDto } from '../../models/card-face';
import html2canvas from 'html2canvas';
import { distinctUntilChanged, from, map, Observable, switchMap, takeUntil } from 'rxjs';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardEditorCurrentCardFaceElementsPerCardFaceComponent } from '../card-editor-current-card-face-elements-per-card-face/card-editor-current-card-face-elements-per-card-face.component';
import { CommonModule } from '@angular/common';
import { filterAgainstNull } from '../../../style/utils/get-style';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';

@Component({
  selector: 'app-card-editor-face-preview',
  imports: [CdkDrag, CdkDragHandle, DragDropModule, CardEditorCurrentCardFaceElementsPerCardFaceComponent, CommonModule],
  templateUrl: './card-editor-face-preview.component.html',
  styleUrl: './card-editor-face-preview.component.css'
})
export class CardEditorFacePreviewComponent implements AfterViewInit {
  private readonly cardEditorPreviewService: CardEditorPreviewService  = inject(CardEditorPreviewService);
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService );
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  
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
    this.setCardEditorFaceColor();
    this.setCardEditorFaceBorderRadius();
    this.setCardEditorFaceBorderColor();

    this.onSetWidth();
    this.onSetHeight();
    this.onBorderDimensionsChange();
  }

  setCardEditorFaceBorderRadius() {
    this.cardEditorControlsDesignCardFaceAttributesService.onBorderRadiusChange$
    .pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef))
    .subscribe((borderRadius: number) => {
      let face = this.cardEditorPreviewService.getCurrentCardFace();
      if (face && face.style) {
        face.style.borderRadius = `${borderRadius}px`;
      }

      this.setCardEditorFaceStyle(face.style);
    })
  }

  setCardEditorFaceBorderColor() {
    this.cardEditorControlsDesignCardFaceAttributesService.onBorderColorChange$
    .pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef))
    .subscribe((borderColor: string) => {
      let face = this.cardEditorPreviewService.getCurrentCardFace();
      if (face && face.style) {
        face.style.borderColor = borderColor;
      }

      this.setCardEditorFaceStyle(face.style);
    })
  }

  setCardEditorFaceColor() {
    this.cardEditorControlsDesignCardFaceAttributesService.onFaceColorChange$
    .pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef))
    .subscribe((color: string) => {
      // So can someone explain to me how assigning by reference works in TS, is this actually mutating the original value
     let face = this.cardEditorPreviewService.getCurrentCardFace();
      if (face && face.style) {
        face.style.backgroundColor = color;
      }

      this.setCardEditorFaceStyle(face.style);
    })
  }

  getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    let { styleId, ...rest } = this.cardEditorPreviewService.getCurrentCardFace().style;

    let filtered: Omit<Style, "styleId"> = filterAgainstNull(rest);

    let service = this.cardEditorControlsDesignCardFaceAttributesService;

    if (filtered.width)
      service.width = parseFloat(String(filtered.width).replace(/[^0-9.\-]+/g, ''));

    if (filtered.height)
      service.height = parseFloat(String(filtered.height).replace(/[^0-9.\-]+/g, ''));

    if (filtered.borderWidth) 
      service.borderDimensions.borderWidth = parseFloat(String(filtered.borderWidth).replace(/[^0-9.\-]+/g, ''));

    let fallback = service.borderDimensions.borderWidth;

    service.borderDimensions.borderTopWidth = this.parseBorderWidth(filtered.borderTopWidth, fallback);
    service.borderDimensions.borderBottomWidth = this.parseBorderWidth(filtered.borderBottomWidth, fallback);
    service.borderDimensions.borderLeftWidth = this.parseBorderWidth(filtered.borderLeftWidth, fallback);
    service.borderDimensions.borderRightWidth = this.parseBorderWidth(filtered.borderRightWidth, fallback);

    // Problem is since border width is after the individual borders in terms of order, it'll override those so we need to do this
    let reordered: Omit<Style, "styleId"> = this.reorderBorderDimensions(filtered);

    // TODO: We refactor to have border dimensions inside of the service then pass that back in

    console.log(`Get card editor face style: ${JSON.stringify(reordered)}`);
    return reordered;
  }

  parseBorderWidth(value: any, fallback: number): number {
    let parsed = parseFloat(String(value).replace(/[^0-9.\-]+/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  }

  reorderBorderDimensions(filtered: Omit<Style, "styleId">): Omit<Style, "styleId"> {
    let reordered: Partial<Omit<Style, "styleId">> = {};

    // 1. Add borderWidth first (shorthand)
    if (filtered.borderWidth) reordered.borderWidth = filtered.borderWidth;

    // 2. Add individual border sides in order, should override
    (["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"] as const).forEach(side => {
      if (filtered[side]) reordered[side] = filtered[side];
    });

    // 3. Add the rest of the properties (if not already added)
    (Object.keys(filtered) as Array<keyof typeof filtered>).forEach(key => {
      if (!(key in reordered)) reordered[key] = filtered[key];
    });

    // Type assertion is safe here because we only copy properties from filtered
    return reordered as Omit<Style, "styleId">;
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

    console.log(`Update current card editor card face dto\nCurrent card face: ${JSON.stringify(this.cardEditorPreviewService.getCurrentCardFace())}\nCurrent Card Editor Card Face Dto: ${JSON.stringify(this.cardEditorPreviewService.currentCardEditorCardFaceDto)}`);
  }

  onBorderDimensionsChange() {
    this.cardEditorControlsDesignCardFaceAttributesService.onBorderDimensionsChange$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((borderDimensions: BorderDimensions) => {
      let face = this.cardEditorPreviewService.getCurrentCardFace();
      if (face && face.style) {
        face.style.borderWidth = `${borderDimensions.borderWidth}px`;
        face.style.borderTopWidth = `${borderDimensions.borderTopWidth}px`;
        face.style.borderBottomWidth = `${borderDimensions.borderBottomWidth}px`;
        face.style.borderLeftWidth = `${borderDimensions.borderLeftWidth}px`;
        face.style.borderRightWidth = `${borderDimensions.borderRightWidth}px`;
      }

      this.setCardEditorFaceStyle(face.style);
    })
  }

   onSetWidth() {
    this.cardEditorControlsDesignCardFaceAttributesService.onSetWidth$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((width: number) => {
      let face = this.cardEditorPreviewService.getCurrentCardFace();
      if (face && face.style) {
        face.style.width = `${width}px`;
      }

      this.setCardEditorFaceStyle(face.style);
    })
  }

  onSetHeight() {
    this.cardEditorControlsDesignCardFaceAttributesService.onSetHeight$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((height: number) => {
      let face = this.cardEditorPreviewService.getCurrentCardFace();
      if (face && face.style) {
        face.style.height = `${height}px`;
      }

      this.setCardEditorFaceStyle(face.style);
    })
  }

  private flattenCardFaceToImage(cardEditorFace: ElementRef<any>): Promise<FormData> {
    return new Promise((resolve, reject) => {
      // TODO: Pass in the ref and scale as parameters
      html2canvas(cardEditorFace.nativeElement, {
        scale: 0.45,
        backgroundColor: "transparent"
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
    this.setCardFaceThumbnailImage$(this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cardFaceThumbnailFilePath: string | undefined) => {
        if (cardFaceThumbnailFilePath === "" || cardFaceThumbnailFilePath === undefined)
        {
          throw new Error("Card face thumbnail file path was never updated");
        }

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

  private setCardFaceThumbnailImage$(cardFaceIndex: number): Observable<string | undefined> {
    return from(this.flattenCardFaceToImage(this.cardEditorFace)).pipe(
      switchMap((cardFaceThumbnailImage: FormData) =>
        this.cardEditorPreviewService
          .createCardFaceThumbnailImage$(cardFaceIndex, cardFaceThumbnailImage)
          .pipe(takeUntilDestroyed(this.destroyRef))
      ),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  createCard() {
    this.setCardFaceThumbnailImage$(this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cardFaceThumbnailFilePath: string | undefined) => {
        if (cardFaceThumbnailFilePath === "" || cardFaceThumbnailFilePath === undefined) {
          throw new Error("Card face thumbnail file path was never updated");
        }

        if (this.cardEditorPreviewService.isNewCardEditorCardDto()) {
          this.cardEditorPreviewService.createCard();
        }
        else {
          this.cardEditorPreviewService.duplicateCard();
        }
      });
  }

  saveCard() {
    this.setCardFaceThumbnailImage$(this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cardFaceThumbnailFilePath: string | undefined) => {
        if (cardFaceThumbnailFilePath === "" || cardFaceThumbnailFilePath === undefined) {
          throw new Error("Card face thumbnail file path was never updated");
        }

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
