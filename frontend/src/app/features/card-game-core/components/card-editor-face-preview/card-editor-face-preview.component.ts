import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, input, InputSignal, ViewChild } from '@angular/core';
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
import { clamp, Coordinates, getMidpoint } from '../../../../utils/utils';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { CardEditorCardDto } from '../../models/card';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';

@Component({
  selector: 'app-card-editor-face-preview',
  imports: [CdkDrag, CdkDragHandle, DragDropModule, CardEditorCurrentCardFaceElementsPerCardFaceComponent, CommonModule, ActionContextMenuComponent],
  templateUrl: './card-editor-face-preview.component.html',
  styleUrl: './card-editor-face-preview.component.css'
})
export class CardEditorFacePreviewComponent implements AfterViewInit {
  private readonly cardEditorPreviewService: CardEditorPreviewService  = inject(CardEditorPreviewService);
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService );
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  
  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;
  @ViewChild("cardFaceElementsPerCardFace") cardFaceElementsPerCardFace!: CardEditorCurrentCardFaceElementsPerCardFaceComponent;

  private contextMenuPosition: Coordinates = {
    x: 0,
    y: 0
  };

  actionContextMenuItems: ActionContextMenuItem[] = [
      {
        id: 0,
        name: 'Export Card (.sbd)',
        action: (cardEditorCardDto: CardEditorCardDto) => {
          if (!cardEditorCardDto) return;
          
          // TODO: Update the card editor card DTO to make sure it has the latest version
          // Convert the JSON into binary?

          // https://runninghill.co.za/blog/downloading-objects-as-json-files-in-angular
          // Create a download function

          // Have a flag to determine when it's done creating the file and then change the name of the action
          // Use that flag to determine what to do?
        },
        disabled: true
      },
       {
        id: 1,
        name: 'Export Card (Atlas)',
        action: () => {
          // TODO: Grab all the file metadata's paths for the thumbnail images
          // Create the images, somehow put them into an atlas?
          // Wait until we have the LODs, gotta make sure we grab LOD0

          // Have an invisible canvas somewhere which then adds the images onto it? Make the size of the atlas texture the dimensions of the images combined, but with a tiny bit of padding?

          // Just seems handy
          // https://stackoverflow.com/questions/52116877/save-hidden-div-as-canvas-image

          // Maybe a service since canvases can be storied in memory?
          /*
          AtlasExportService {
          // We probably want this to be universal, so grab the file names and attach the paths
          async createAtlas(imagePaths: string[]): Promise<string> {
            let canvas = document.createElement('canvas');
           
            let ctx = canvas.getContext('2d');
            // We need to set the dimensions
            // Also set that gap somehow
            // Potentially 2 per row?

            for (let path of imagePaths) {
              // get file paths
              let  img: Image = new Image();
              img.src = path;

              // Grab that blob, then draw image?

              // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
              ctx.drawImage(img, ...);
            }
            return canvas.toDataURL('image/png');
          }
           */
        },
        disabled: true
      }
    ];

  isDisplayContextMenu: boolean = false;
      
  constructor() {
    this.cardEditorControlsDesignCardFaceAttributesService.cardFaceId = this.cardEditorPreviewService.getCurrentCardFace().cardFaceId;
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

    this.onCreateCard();
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
      width = clamp(width, 0, this.cardEditorPreviewService.MAX_CARD_FACE_WIDTH);
      
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
      height = clamp(height, 0, this.cardEditorPreviewService.MAX_CARD_FACE_HEIGHT);
      
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

        this.cardEditorControlsDesignCardFaceAttributesService.cardFaceId = this.cardEditorPreviewService.getCurrentCardFace().cardFaceId;
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

  onCreateCard() {
    this.cardEditorPreviewService.onCreateCard$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
        this.cardEditorControlsDesignCardFaceAttributesService.cardFaceId = this.cardEditorPreviewService.getCurrentCardFace().cardFaceId;
    })
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

  onCardEditorFaceRightClick(event: MouseEvent): void {
    event.preventDefault();
    
    let cardFaceRect: DOMRect = this.cardEditorFace.nativeElement.getBoundingClientRect();
    // NOTE: If we grab the top and left, it's going to cause issues because of displacement
    // FIXME: It's still not actually centred but that's fine
    let midpoint: Coordinates = getMidpoint(
      {
        x: 0,
        y: 0
      },
      {
        x: cardFaceRect.width,
        y: cardFaceRect.height
      }
    );

    this.contextMenuPosition = midpoint;
    this.isDisplayContextMenu = true;
  }

  @HostListener('document:click')
  documentClick(): void {
    this.isDisplayContextMenu = false;
  }

  // NOTE: Should be right considering it's not a child of the cards face itself
  getRightClickMenuStyle() {
    return {
      position: 'fixed',
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`
    }
  }

  handleActionContextMenuItemClick(item: ActionContextMenuItem) {

  }
}
