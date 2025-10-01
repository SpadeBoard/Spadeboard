import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, from, Observable, switchMap } from 'rxjs';
import { clamp, Coordinates, exportCustomTypeFile, flattenToImage, generateResizedImagesAtQualities, getMidpoint } from '../../../../utils/utils';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { BorderDimensions, Style } from '../../../style/models/style';
import { filterAgainstNull } from '../../../style/utils/get-style';
import { CardEditorCardDto } from '../../models/card';
import { FileAuthenticationPerExportedCard } from '../../models/file-authentication-per-exported-card';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { FileAuthenticationPerExportedCardApiService } from '../../services/card-game-core/api/file-authentication-per-exported-card-api.service';
import { DEFAULT_CARD_FACE_BORDER_RADIUS, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { isCardEditorCardDto } from '../../utils/card-game-core.utils';
import { CardEditorCurrentCardFaceElementsPerCardFaceComponent } from '../card-editor-current-card-face-elements-per-card-face/card-editor-current-card-face-elements-per-card-face.component';
import { CardEditorFacePreviewGridComponent } from '../card-editor-face-preview-grid/card-editor-face-preview-grid.component';

@Component({
  selector: 'app-card-editor-face-preview',
  imports: [DragDropModule, CardEditorFacePreviewGridComponent, CardEditorCurrentCardFaceElementsPerCardFaceComponent, CommonModule, ActionContextMenuComponent],
  templateUrl: './card-editor-face-preview.component.html',
  styleUrl: './card-editor-face-preview.component.scss'
})
export class CardEditorFacePreviewComponent implements AfterViewInit {
  private readonly cardEditorPreviewService: CardEditorPreviewService  = inject(CardEditorPreviewService);
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService );
  private readonly fileAuthenticationPerExportedCardApiService: FileAuthenticationPerExportedCardApiService = inject(FileAuthenticationPerExportedCardApiService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  
  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;
  @ViewChild("cardFaceElementsPerCardFace") cardFaceElementsPerCardFace!: CardEditorCurrentCardFaceElementsPerCardFaceComponent;
  @ViewChild('importedCardFileInput') importedCardFileInput!: ElementRef<HTMLInputElement>;

  shouldSnapToGrid: boolean = false;

  @HostListener('document:keyup', ['$event'])
  handleCtrlUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.shouldSnapToGrid = !this.shouldSnapToGrid;
    }
  }
  
  private contextMenuPosition: Coordinates = {
    x: 0,
    y: 0
  };

  // TODO: Have action context menu items be groupable
  actionContextMenuItems: ActionContextMenuItem[] = [
      {
        id: 0,
        name: 'Import Card (.sbd)',
        action: (cardEditorCardDto: CardEditorCardDto) => {
          // CHECKME: You should be able to import cards that have already been deleted and elements that have been already deleted
          if (!cardEditorCardDto)
            throw new Error("No card editor card dto to be found");

          if (cardEditorCardDto.card.cardId === "0")
            throw new Error("Can't import export a card that hasn't been made yet.");

          this.fileAuthenticationPerExportedCardApiService.isValidImport$(cardEditorCardDto).subscribe((isValidImport: boolean) => {
            if (!isValidImport)
              throw new Error("Invalid import, either card ID or file hash doesn't match");

            this.cardEditorPreviewService.duplicateCard$(cardEditorCardDto).subscribe((result: CardEditorCardDto | undefined) => {
              if (!result)
                throw new Error("Invalid import, can't duplicate card");

              this.cardEditorPreviewService.setOnCreateCardEditorCardDto(cardEditorCardDto);

              // TODO: Make a flag that can automatically just open the card in the editor
              if (window.confirm('Open imported card in editor? The currently opened card will be overridden in the editor..')) {
                this.cardEditorPreviewService.setCardEditorCardDtoByCardId(cardEditorCardDto.card.cardId);
              }
            });
          });
          
          // TODO: Make the preview service create card, duplicate cards and update cards into pure functions
        },
        disabled: false
      },
      {
        id: 1,
        name: 'Export Card (.sbd)',
        action: (cardEditorCardDto: CardEditorCardDto) => {
          if (!cardEditorCardDto)
            throw new Error("No card editor card dto to be found");

          if (cardEditorCardDto.card.cardId === "0")
            throw new Error("Can't export a card that hasn't been made yet.");

          let fileAuthenticationPerExportedCard: FileAuthenticationPerExportedCard = {
            fileAuthenticationPerExportedCardId: "0",
            cardId: cardEditorCardDto.card.cardId,
            cardEditorCardDto,
            fileHash: "",
            digitalSignature: ""
          }

          // TODO: Figure out the digital signature
          this.fileAuthenticationPerExportedCardApiService.createFileAuthenticationPerExportedCard$(fileAuthenticationPerExportedCard).subscribe((fileAuthenticationPerExportedCard: FileAuthenticationPerExportedCard | undefined) =>{
            if (!fileAuthenticationPerExportedCard)
              throw new Error("File authentication per exported card wasn't created");
            
            exportCustomTypeFile(cardEditorCardDto, `${cardEditorCardDto.card.cardId}`, 'sbd');
          })
        },
        disabled: false
      },
       {
        id: 2,
        name: 'Export (Atlas)',
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

  cardFaceBorderRadius: number = DEFAULT_CARD_FACE_BORDER_RADIUS;
      
  constructor() {
    this.cardEditorControlsDesignCardFaceAttributesService.setCurrentCardFaceId();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // console.log(`After view init cef preview component: ${JSON.stringify(this.cardEditorFace.nativeElement)}`);
  
    this.onFlip();
    this.getCardEditorFaceStyle();
    this.setCardEditorFaceColor();
    this.setCardEditorFaceBorderRadius();
    this.setCardEditorFaceBorderColor();

    this.onSetWidth();
    this.onSetHeight();
    this.onBorderDimensionsChange();

    this.onCreateCardEditorCardDto();
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
        this.cardFaceBorderRadius = borderRadius;
      }

      this.setCardEditorFaceStyle(face.style);
    })
  }

  setCardEditorFaceBorderColor() {
    this.cardEditorControlsDesignCardFaceAttributesService.onBorderColorChange$
    .pipe(
      // distinctUntilChanged(),
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
      // distinctUntilChanged(),
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

   // Get the correct border width properties
    let borderWidthProps: Omit<Style, 'styleId'> = this.getBorderWidthStyle(filtered);

    // Remove all border width properties from filtered to avoid duplication
    let {
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderWidth,

      ...other
    } = filtered;

    // Merge the border width props with the rest of the styles
    let final: Omit<Style, "styleId"> = {
      ...other,
      ...borderWidthProps
    };

    // console.log(`Get card editor face style: ${JSON.stringify(final)}`);
    return final;
  }

  getBorderWidthStyle(style: Style | Omit<Style, 'styleId'>): Omit<Style, 'styleId'> {
    let { borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth, borderWidth } = style;

    // ASSUMPTION: All sides will always have a value or no sides have value at all
    if (
      (borderTopWidth === borderRightWidth &&
        borderTopWidth === borderBottomWidth &&
        borderTopWidth === borderLeftWidth) 
        || 
      (!borderTopWidth || 
        !borderBottomWidth || 
        !borderLeftWidth || 
        !borderRightWidth
      )
    ) {
      // All sides are equal or missing at least one, use shorthand
      return { borderWidth };
    } else {
      // Sides are not equal, use individual sides
      return {
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth
      };
    }
  }

  /*parseBorderWidth(value: any, fallback: number): number {
    let parsed = parseFloat(String(value).replace(/[^0-9.\-]+/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  }*/

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
    if (style) { this.updateCurrentCardEditorCardFaceDto(style); }
  }

  updateCurrentCardEditorCardFaceDto(currentCardFaceStyle: Style) {
    this.cardEditorPreviewService.updateCurrentCardFaceStyle(currentCardFaceStyle);
    this.cardEditorPreviewService.updateCardEditorCardFaceDto();

    console.log(`Update current card editor card face dto\nCurrent card face: ${JSON.stringify(this.cardEditorPreviewService.getCurrentCardFace(), null, 2)}\nCurrent Card Face Per Lods: ${JSON.stringify(this.cardEditorPreviewService.getCurrentCardFacePerLods, null, 2)}\nCurrent Card Editor Card Face Dto: ${JSON.stringify(this.cardEditorPreviewService.currentCardEditorCardFaceDto, null, 2)}`);
  }

  onBorderDimensionsChange() {
    this.cardEditorControlsDesignCardFaceAttributesService.onBorderDimensionsChange$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((borderDimensions: BorderDimensions) => {
      let face = this.cardEditorPreviewService.getCurrentCardFace().style;

      if (!face || !borderDimensions)
        return;
        let {
          top,
          bottom,
          left,
          right
        } = borderDimensions.borderRect;

        face.borderWidth = `${borderDimensions.borderWidth}px`;
        face.borderTopWidth = `${top}px`;
        face.borderBottomWidth = `${bottom}px`;
        face.borderLeftWidth = `${left}px`;
        face.borderRightWidth = `${right}px`;

      this.setCardEditorFaceStyle(face);
    })
  }

   onSetWidth() {
    this.cardEditorControlsDesignCardFaceAttributesService.onSetWidth$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((width: number) => {
      width = clamp(width, MIN_CARD_FACE_WIDTH, MAX_CARD_FACE_WIDTH);
      
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
      height = clamp(height, MIN_CARD_FACE_HEIGHT, MAX_CARD_FACE_HEIGHT);
      
      let face = this.cardEditorPreviewService.getCurrentCardFace();
      if (face && face.style) {
        face.style.height = `${height}px`;
      }

      this.setCardEditorFaceStyle(face.style);
    })
  }

  updateCardEditorCardFaceDto() {
    this.setCardFaceThumbnailImages$(this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cardFaceThumbnailFilePaths: string[] | undefined) => {
        if ( !cardFaceThumbnailFilePaths || cardFaceThumbnailFilePaths.length <= 0) {
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

  // CHECKME: Do we want to remove this eventually?
  private setCardFaceThumbnailImage$(cardFaceIndex: number): Observable<string | undefined> {
    // TODO: Replace with flattenToImages
    return from(flattenToImage(this.cardEditorFace)).pipe(
      switchMap((cardFaceThumbnailImage: FormData) =>
        this.cardEditorPreviewService
          .createCardFaceThumbnailImage$(cardFaceIndex, cardFaceThumbnailImage)
          .pipe(takeUntilDestroyed(this.destroyRef))
      ),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  // https://www.npmjs.com/package/image-blob-reduce
  private setCardFaceThumbnailImages$(cardEditorCardDto: CardEditorCardDto, cardFaceIndex: number): Observable<string[] | undefined> {
    return from(flattenToImage(this.cardEditorFace))
      .pipe(
        switchMap((originalThumbnail: FormData) =>
          from(generateResizedImagesAtQualities(originalThumbnail)).
            pipe(
              switchMap((differentQualitiesThumbnails: FormData) =>
                this.cardEditorPreviewService
                  .createCardFaceThumbnailImages$(cardEditorCardDto, cardFaceIndex,differentQualitiesThumbnails)
                  .pipe(takeUntilDestroyed(this.destroyRef))
              )
          )
      ),
      takeUntilDestroyed(this.destroyRef)
    );
  }


  createCard() {
    this.setCardFaceThumbnailImages$(this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cardFaceThumbnailFilePaths: string[] | undefined) => {
        if ( !cardFaceThumbnailFilePaths || cardFaceThumbnailFilePaths.length <= 0) {
          throw new Error("Card face thumbnail file path was never updated");
        }

        if (this.cardEditorPreviewService.isNewCardEditorCardDto()) {
          this.cardEditorPreviewService.createCard$(this.cardEditorPreviewService.cardEditorCardDto)
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
            this.cardEditorPreviewService.createCardPostApiOperation(cardEditorCardDto);
          });
        }
        else {
          this.cardEditorPreviewService.duplicateCard$(this.cardEditorPreviewService.cardEditorCardDto)
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
            this.cardEditorPreviewService.duplicateCardPostApiOperation(cardEditorCardDto);
          });
        }
      });
  }

  onCreateCardEditorCardDto() {
    this.cardEditorPreviewService.onCreateCardEditorCardDto$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
        this.cardEditorControlsDesignCardFaceAttributesService.setCurrentCardFaceId();
    })
  }

  saveCard() {
    this.setCardFaceThumbnailImages$(this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cardFaceThumbnailFilePaths: string[] | undefined) => {
        if ( !cardFaceThumbnailFilePaths || cardFaceThumbnailFilePaths.length <= 0) {
          throw new Error("Card face thumbnail file path was never updated");
        }

        this.cardEditorPreviewService.updateCard$(this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.cardFaceElementsPerCardFaceToDeleteIds, this.cardEditorPreviewService.tagNamesToDelete)
          .subscribe({
            next: (cardEditorCardDto: CardEditorCardDto | undefined) => {
              if (cardEditorCardDto) this.cardEditorPreviewService.updateCardPostApiOperation(cardEditorCardDto);
            },
            error: (err) => {
              console.error('Something went wrong:', err);
            }
          });
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
      top: `${this.contextMenuPosition.y}px`,
      zIndex: 10
    }
  }

  handleActionContextMenuItemClick(item: ActionContextMenuItem) {
    switch(item.id) {
      case 0:
        this.importedCardFileInput.nativeElement.value = '';
        this.importedCardFileInput.nativeElement.click();
        break;
      case 1:
        this.actionContextMenuItems[1].action(this.cardEditorPreviewService.cardEditorCardDto);
        break;
    }
  }

  // TODO: Modify authentication method to make sure this would work with other instances
  onImportedCardFileSelected(event: Event) {
    let input: HTMLInputElement = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let selectedFile: File = input.files[0];
      let fileReader: FileReader = new FileReader();

      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          let json: string = JSON.parse(event.target?.result as string); // Parse file content as JSON
          if (!isCardEditorCardDto(json)) {
            throw new Error("Didn't upload a card editor card dto");
          }
         
          let cardEditorCardDto: CardEditorCardDto = json;
          this.actionContextMenuItems[0].action(cardEditorCardDto);
        } catch (e: any) {
          // Handle parse or validation errors
          console.error(e);
        }
      };

      fileReader.readAsText(selectedFile); // Actually read the file[8][2]
    }
  }
}
