import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, from, iif, Observable, switchMap } from 'rxjs';
import { clamp, Coordinates, exportCustomTypeFile, flattenToImage, generateResizedImagesAtQualities, getMidpoint, unzipImages } from '../../../../utils/utils';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { BorderDimensions, Style } from '../../../style/models/style';
import { filterAgainstNull } from '../../../style/utils/get-style';
import { CardEditorCardDto } from '../../models/card';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-editor-controls-design-card-face-attributes.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { DEFAULT_ATLAS_EXPORT_LOD, DEFAULT_CARD_FACE_BORDER_RADIUS, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { isCardEditorCardDto } from '../../utils/card-game-core.utils';
import { CardEditorCurrentCardFaceElementsPerCardFaceComponent } from '../card-editor-current-card-face-elements-per-card-face/card-editor-current-card-face-elements-per-card-face.component';
import { CardEditorFacePreviewGridComponent } from './card-editor-face-preview-grid/card-editor-face-preview-grid.component';
import { AtlasExportService } from '../../../../utils/services/atlas-export/atlas-export.service';
import { CardFacePerCardApiService } from '../../services/card-game-core/api/card-face-per-card-api.service';
import canvasSize from 'canvas-size';
import { CardApiService } from '../../services/card-game-core/api/card-api.service';

@Component({
  selector: 'app-card-editor-face-preview',
  imports: [DragDropModule, CardEditorFacePreviewGridComponent, CardEditorCurrentCardFaceElementsPerCardFaceComponent, CommonModule, ActionContextMenuComponent],
  templateUrl: './card-editor-face-preview.component.html',
  styleUrl: './card-editor-face-preview.component.scss'
})
export class CardEditorFacePreviewComponent implements AfterViewInit {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);
  private readonly cardApiService: CardApiService = inject(CardApiService);

  private readonly cardFacesPerCardApiService: CardFacePerCardApiService = inject(CardFacePerCardApiService);

  private readonly atlasExportService: AtlasExportService = inject(AtlasExportService);
  

  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  
  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;
  @ViewChild("cardFaceElementsPerCardFace") cardFaceElementsPerCardFace!: CardEditorCurrentCardFaceElementsPerCardFaceComponent;
  @ViewChild('importedCardFileInput') importedCardFileInput!: ElementRef<HTMLInputElement>;

  protected shouldSnapToGrid: boolean = false;

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
  protected actionContextMenuItems: ActionContextMenuItem[] = [
    {
      id: 0,
      name: 'Import Card (.sbd)',
      action: (cardEditorCardDto: CardEditorCardDto) => {
        // CHECKME: You should be able to import cards that have already been deleted and elements that have been already deleted
        if (!cardEditorCardDto)
          throw new Error("No card editor card dto to be found");

        if (cardEditorCardDto.card.cardId === "0")
          throw new Error("Can't import export a card that hasn't been made yet.");

        // 1. Make the dynamic component
        /*
        <div #cardEditorFace [ngStyle]="getCardEditorFaceStyle()" (contextmenu)="onCardEditorFaceRightClick($event)">
            <app-card-editor-face-preview-grid [shouldSnapToGrid]="shouldSnapToGrid" data-html2canvas-ignore="true"/>
            <app-card-editor-current-card-face-elements-per-card-face [cardFaceBorderRadius]="cardFaceBorderRadius" [shouldSnapToGrid]="shouldSnapToGrid" #cardFaceElementsPerCardFace/>
        </div>
        */

        // 2. Set it offscreen and pass in all the inputs

        // 3. Add the results of the canvas back into cardEditorCardDto

        // 4. This
        this.cardApiService.exists$(cardEditorCardDto.card.cardId)
          .pipe(
            switchMap((exists: boolean) => {
              return iif(
                () => exists,
                this.cardEditorPreviewService.duplicateCard$(cardEditorCardDto),
                this.cardEditorPreviewService.createCard$(cardEditorCardDto)
              );
            })
          )
          .subscribe((result: CardEditorCardDto | undefined) => {
            if (!result)
              throw new Error("Invalid import, can't duplicate card");

            this.cardEditorPreviewService.setOnCreateCardEditorCardDto(result);

            // TODO: Make a flag that can automatically just open the card in the editor
            if (window.confirm('Open imported card in editor? The currently opened card will be overridden in the editor..')) {
              this.cardEditorPreviewService.setCardEditorCardDtoByCardId(result.card.cardId);
            }
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

          exportCustomTypeFile(Object.fromEntries(Object.entries(cardEditorCardDto).filter(([key]) => key !== 'fileMetadataLods')), `${cardEditorCardDto.card.cardId}`, 'sbd');
        },
        disabled: false
      },
       {
        id: 2,
        name: 'Export (Atlas)',
        action: (cardEditorCardDto: CardEditorCardDto) => {
          if (!cardEditorCardDto)
            throw new Error("No card editor card dto to be found");

          if (cardEditorCardDto.card.cardId === "0")
            throw new Error("Can't export a card that hasn't been made yet.");

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
            }});
        },
        disabled: false
      }
    ];

  protected isDisplayContextMenu: boolean = false;

  protected cardFaceBorderRadius: number = DEFAULT_CARD_FACE_BORDER_RADIUS;
      
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

    console.log(`Update current card editor card face dto\nCurrent card face: ${JSON.stringify(this.cardEditorPreviewService.getCurrentCardFace(), null, 2)}\nCurrent Card Face Per Lods: ${JSON.stringify(this.cardEditorPreviewService.getCurrentCardFace, null, 2)}\nCurrent Card Editor Card Face Dto: ${JSON.stringify(this.cardEditorPreviewService.currentCardEditorCardFaceDto, null, 2)}`);
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
      case 2:
        this.actionContextMenuItems[2].action(this.cardEditorPreviewService.cardEditorCardDto);
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
