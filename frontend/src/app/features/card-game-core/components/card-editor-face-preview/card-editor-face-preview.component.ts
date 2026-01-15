import { DragDropModule } from '@angular/cdk/drag-drop';

import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, iif, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { FileMetadataService } from '../../../../utils/services/file/metadata/facade/file-metadata.service';
import { Coordinates, Dimensions, stringify, unsubscription } from '../../../../utils/utils';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { ActionContextMenuService } from '../../../actions-context-menu/services/action-context-menu.service';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { BorderDimensions, Style } from '../../../style/models/style';
import { CardEditorCardDto } from '../../models/card';
import { CardFace } from '../../models/card-face';
import { CardFaceElementPerCardFace } from '../../models/card-face-element';
import { CardEditorApiService } from '../../services/card-game-core/card-editor/api/card-editor-api.service';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/attributes/card-editor-controls-design-element-attributes.service';
import { CardEditorControlsElementLayeringAttributesService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/attributes/card-editor-controls-element-layering-attributes.service';
import { CardEditorControlsDesignImageService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/card-editor-controls-design-image.service';
import { CardEditorControlsDesignRteService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/card-editor-controls-design-rte.service';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../services/card-game-core/card-editor/controls/design/card-face/card-editor-controls-design-card-face-attributes.service';
import { CardEditorOperationsService } from '../../services/card-game-core/card-editor/operations/card-editor-operations.service';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardFaceElementService } from '../../services/card-game-core/card-face-element/card-face-element.service';
import { CardFaceElementImageService } from '../../services/card-game-core/card-face-element/images/card-face-element-image.service';
import { CardFaceElementRtService } from '../../services/card-game-core/card-face-element/rt/card-face-element-rt.service';
import { CardFaceLodsService } from '../../services/card-game-core/card-face/lods/card-face-lods.service';
import { CardFaceStyleService } from '../../services/card-game-core/card-face/style/card-face-style.service';
import { DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID, DEFAULT_MODAL_STYLE } from '../../utils/card-editor.constants';
import { isCardEditorCardDto } from '../../utils/card-game-core.utils';
import { CardEditorCurrentCardFaceElementsPerCardFaceComponent } from '../card-editor-current-card-face-elements-per-card-face/card-editor-current-card-face-elements-per-card-face.component';
import { CardEditorFacePreviewGridComponent } from './card-editor-face-preview-grid/card-editor-face-preview-grid.component';

@Component({
  selector: 'app-card-editor-face-preview',
  imports: [DragDropModule, CardEditorFacePreviewGridComponent, CardEditorCurrentCardFaceElementsPerCardFaceComponent],
  templateUrl: './card-editor-face-preview.component.html',
  styleUrl: './card-editor-face-preview.component.scss'
})
export class CardEditorFacePreviewComponent implements AfterViewInit {
  /****************************** SERVICES **************************************/
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);
  private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);

  private readonly fileMetadataService: FileMetadataService = inject(FileMetadataService);

  private readonly cardFaceLodsService: CardFaceLodsService = inject(CardFaceLodsService);
  private readonly cardFaceStyleService: CardFaceStyleService = inject(CardFaceStyleService);

  private readonly actionContextMenuService: ActionContextMenuService = inject(ActionContextMenuService);

  private readonly cardFaceElementService: CardFaceElementService = inject(CardFaceElementService);

  private readonly cardFaceElementRtService: CardFaceElementRtService = inject(CardFaceElementRtService);
  private readonly cardFaceElementImageService: CardFaceElementImageService = inject(CardFaceElementImageService);

  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);
  private readonly cardEditorControlsElementLayeringAttributesService: CardEditorControlsElementLayeringAttributesService = inject(CardEditorControlsElementLayeringAttributesService);

  private readonly cardEditorControlsDesignRteService: CardEditorControlsDesignRteService = inject(CardEditorControlsDesignRteService);
  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);
  /****************************** SERVICES **************************************/

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private cardFaceColorOperations: Map<string, Function> = new Map<string, Function>([
    ['face', (color: string) => this.setColor(color, 'face')],
    ['edge', (color: string) => this.setColor(color, 'edge')]
  ]);

  private cardFaceDimensionsOperations: Map<string, Function> = new Map<string, Function>([
    ['w', (dimension: number) => this.setDimensions(dimension, 'w')],
    ['h', (dimension: number) => this.setDimensions(dimension, 'h')]
  ]);

  private cardEditorFacePreviewOperations: Map<string, Function> = new Map<string, Function>([
    ['create', () => this.createCard()],
    ['save', () => this.saveCard()]
  ]);

  private processFlipOperations: Map<string, Function> = new Map<string, Function>([
    ['on', () => this.onFlip()],
    ['post', () => this.postFlip()]
  ])

  private cardEditorCardDtoOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (cardEditorCardDto: CardEditorCardDto) => this.createdCardEditorCardDto(cardEditorCardDto)],
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.updatedCardEditorCardDto(cardEditorCardDto)]
  ])

  private cardFaceElementsPerCardFaceOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (emitted: { type: string, dndPosition: DndPosition }) => this.createdCardFaceElementPerCardFace(emitted)],
    ['delete', (emitted: string) => this.deletedCardFaceElementPerCardFace(emitted)]
  ]);

  private imageEditorStatusOperations: Map<string, Function> = new Map<string, Function>([
    ['enable', (id: string) => this.enableImageEditor(id)],
    ['upload', (src: string) => this.uploadmage(src)],
    ['disable', (src: string) => this.disableImageEditor(src)]
  ]);

  private rteStatusOperations: Map<string, Function> = new Map<string, Function>([
    ['enable', (emitted: { id: string, text: string }) => this.enableRte(emitted)],
  ]);

  private cardFaceElementAttributes$$: Subscription | null = null;

  private cardFaceElementLayering$$: Subscription | null = null;

  private cardFaceElementsPerCardFaceOperations$$: Subscription | null = null;

  /******************** SIGNALS *************************/
  protected shouldSnapToGrid: boolean = false;

  // TODO: Have action context menu items be groupable
  protected actionContextMenuItems: ActionContextMenuItem[] = [];

  protected cardFaceBorderRadius: number = DEFAULT_CARD_FACE_BORDER_RADIUS;

  public cardFaceElementId: string = '';

  public cardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = [];

  @ViewChild(CardEditorCurrentCardFaceElementsPerCardFaceComponent) cardEditorCurrentCardFaceElementsPerCardFaceComponent!: CardEditorCurrentCardFaceElementsPerCardFaceComponent;
  /******************** SIGNALS *************************/

  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;

  @ViewChild('importedCardFileInput') importedCardFileInput!: ElementRef<HTMLInputElement>;

  private actionContextMenuId: string = '';

  @HostListener('document:keyup', ['$event'])
  protected handleCtrlUp(event: KeyboardEvent): void {
    if (event.key === 'Control') {
      this.shouldSnapToGrid = !this.shouldSnapToGrid;
    }
  }

  constructor() {
    this.actionContextMenuItems = this.cardEditorOperationsService.getPreviewMenuItems();

    this.setCardEditorCardDto();

    this.setCurrentCardFaceId();

    this.onProcessFlip();
    this.onClickOperation();
    this.orphanFileMetadata();
    this.clearOrphanedFileMetadata();

    this.onCardEditorCardDtoOperations();
    this.onCardFaceElementsPerCardFaceOperations();

    this.onRteTextChange();
    this.onRteStatusToggle();

    this.onImageEditorStatusToggle();
  }

  public ngAfterViewInit(): void {
    // console.log(`After view init cef preview component: ${JSON.stringify(this.cardEditorFace.nativeElement)}`);
    this.getCardEditorFaceStyle();
    this.onCardFaceAppearanceAttributes();
  }

  private duplicateCardObservables(cardEditorCardDto: CardEditorCardDto): Array<Observable<any>> {
    return [
      this.cardFaceElementImageService.duplicateCardFaceElementImages$(cardEditorCardDto, this.destroyRef),
      this.cardFaceLodsService.duplicateCardFaceThumbnails$(cardEditorCardDto, this.destroyRef),
    ]
  }

  // TODO: Move into another function
  private setCardFaceElementsPerCardFace(): void;
  private setCardFaceElementsPerCardFace(cardFaceElementsPerCardFace?: CardFaceElementPerCardFace[]): void {
    if (cardFaceElementsPerCardFace) this.cardFaceElementsPerCardFace = ([...cardFaceElementsPerCardFace]);

    this.cardFaceElementsPerCardFace = ([...this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace()]);
    console.log(`%c${this.constructor.name} - ${this.setCardFaceElementsPerCardFace.name}:\ncardFaceElementsPerCardFace:\n${stringify(this.cardFaceElementsPerCardFace)}`, `color: #504B38; background: #F8F3D9; padding: 5px; border-radius: 5px;`);
  }

  protected getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return { ...this.cardFaceStyleService.getStyle(this.getCurrentCardFaceStyle()), margin: 'auto' };
  }

  // CHECKME: Is this being used correctly
  private clearOrphanedFileMetadata(): void {
    this.cardEditorApiService.clear$.subscribe(() => {
      this.cardFaceLodsService.clear();
      this.cardFaceElementImageService.clear();
      this.cardFaceElementService.clear(); // CHECKME: Do we clear here?
    });
  }

  private getCurrentCardFace(): CardFace {
    return this.cardEditorPreviewService.getCurrentCardFace();
  }

  private setCurrentCardFaceId(): void {
    this.cardEditorControlsDesignCardFaceAttributesService.setCurrentCardFaceId(this.getCurrentCardFace().cardFaceId);
  }

  private getCurrentCardFaceStyle(): Style {
    let face: Style = this.cardEditorPreviewService.getCurrentCardFace().style;

    if (!face) throw new Error("No style associated with card face");

    return face;
  }

  private setColor(color: string, operation: string): void {
    if (operation !== 'face' && operation !== 'edge') throw new Error("Set color operation has to be face or edge");

    this.cardFaceStyleService.setColor(color, this.getCurrentCardFaceStyle(), operation);
  }

  private setDimensions(dimension: number, operation: string): void {
    if (operation !== 'w' && operation !== 'h') throw new Error("Set dimension operation has to be w or h");

    this.cardFaceStyleService.setDimensions(dimension, this.getCurrentCardFaceStyle(), operation);
  }

  private setBorderRadius(radius: number): void {
    this.cardFaceStyleService.setBorderRadius(radius, this.getCurrentCardFaceStyle());
  }

  private setBorderDimensions(bd: BorderDimensions): void {
    this.cardFaceStyleService.setDimensions(bd, this.getCurrentCardFaceStyle());
  }

  private onCardFaceAppearanceAttributes(): void {
    this.cardEditorControlsDesignCardFaceAttributesService.cardFaceColorAttributes(this.cardFaceColorOperations);
    this.cardEditorControlsDesignCardFaceAttributesService.borderRadiusChange((radius: number) => this.setBorderRadius(radius));
    this.cardEditorControlsDesignCardFaceAttributesService.borderDimensionsChange((bd: BorderDimensions) => this.setBorderDimensions(bd));
    this.cardEditorControlsDesignCardFaceAttributesService.cardFaceDimensionsAttributes(this.cardFaceDimensionsOperations);
  }

  private onCardFaceElementsLayering(cardFaceElementId: string, cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    unsubscription(this.cardFaceElementLayering$$);
    this.cardFaceElementLayering$$ = this.cardEditorControlsElementLayeringAttributesService.onCardFaceElementsLayering((operation: string) => {
      if (operation !== 'front' && operation !== 'back') throw new Error('No operation to card face element layer');

      this.cardFaceElementService.setLayer(cardFaceElementId, cardFaceElementsPerCardFace, operation);
    }, this.destroyRef);
  }

  private updateCardEditorCardFaceDto(): void {
    this.cardFaceLodsService.setCardFaceThumbnailImages$(this.cardEditorFace, this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cardFaceThumbnailFilePaths: string[] | undefined) => {
        if (!cardFaceThumbnailFilePaths || cardFaceThumbnailFilePaths.length <= 0) throw new Error("Card face thumbnail file path was never updated");

        this.setCardFaceElementsPerCardFace();
        this.cardEditorPreviewService.setCardEditorCardFaceDto(this.cardEditorPreviewService.currentCardEditorCardFaceDto);
      })
  }

  private onProcessFlip(): void {
    this.cardEditorOperationsService.onProcessFlip(this.processFlipOperations, this.destroyRef);
  }

  private onFlip(): void {
    console.log(`%c${this.constructor.name} - ${this.onFlip.name} (time: ${Date.now().toLocaleString("en-US")})} (before)`, `color: #22577a; background: #c7f9cc; padding: 5px; border-radius: 5px;`);

    this.updateCardEditorCardFaceDto();
    this.cardEditorPreviewService.onFlipCurrentCardFace();
    this.cardEditorOperationsService.postFlip();
  }

  private postFlip(): void {
    this.resetElementAttributes();
  }

  private resetElementAttributes(): void {
    this.cardFaceElementId = DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID;

    // TODO: Disable RTE
    this.cardEditorControlsDesignElementAttributesService.resetElementAttributes();

    unsubscription(this.cardFaceElementAttributes$$);
    unsubscription(this.cardFaceElementLayering$$);
    // unsubscription(this.cardFaceElementAttributes$$); // CHECKME
  }

  // TODO: Problem is there's no getCardFaceElementPerCardFace available when the editor opens
  private onCardFaceElementAttributes(cardFaceElementPerCardFace: CardFaceElementPerCardFace): void {
    unsubscription(this.cardFaceElementAttributes$$);
    this.cardFaceElementAttributes$$ = this.cardEditorControlsDesignElementAttributesService.onCardFaceElementAttributes(cardFaceElementPerCardFace, this.destroyRef);
  }

  public getCardFaceElementPerCardFace(): CardFaceElementPerCardFace {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.cardFaceElementService.getCardFaceElementPerCardFace(this.cardFaceElementId, this.cardFaceElementsPerCardFace);
    if (!cardFaceElementPerCardFace) throw new Error("Card editor face preview: There is no current card face element per card face to set attributes");
    return cardFaceElementPerCardFace;
  }

  protected setElementAttributes(cardFaceElementId: string): void {
    this.setCurrentCardFaceElementId(cardFaceElementId, true);

    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = this.getCardFaceElementPerCardFace();

    // NOTE: This should refresh the cardFaceElementPerCardFace and allow these to be subscribed properly
    this.onCardFaceElementAttributes(cardFaceElementPerCardFace);
    this.onCardFaceElementsLayering(cardFaceElementId, this.cardFaceElementsPerCardFace);

    this.setElementAttributesPosition(this.cardFaceElementService.getCardFaceElementPosition(cardFaceElementPerCardFace));
    this.setElementAttributesDimensions(this.cardFaceElementService.getCardFaceElementDimensions(cardFaceElementPerCardFace));
  }

  protected setCurrentCardFaceElementId(cardFaceElementId: string, shouldSetAttribute?: boolean): void {
    this.cardFaceElementId = cardFaceElementId;

    if (shouldSetAttribute) this.cardEditorControlsDesignElementAttributesService.$currentCardFaceElementId.set(this.cardFaceElementId);
  }

  protected setElementPosition(coordinates: Coordinates): void {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = this.getCardFaceElementPerCardFace();

    this.cardFaceElementService.setCardFaceElementPosition(coordinates, cardFaceElementPerCardFace);
    this.setElementAttributesPosition(this.cardFaceElementService.getCardFaceElementPosition(cardFaceElementPerCardFace));
  }

  // TODO: Set these as output signals into the card face configureCardFaceElements per card face
  protected setElementAttributesPosition(position: Coordinates): void {
    this.cardEditorControlsDesignElementAttributesService.setElementAttributesPosition(position);
  }

  protected setElementDimensions(dimensions: Dimensions): void {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = this.getCardFaceElementPerCardFace();

    this.cardFaceElementService.setCardFaceElementDimensions(dimensions, cardFaceElementPerCardFace);
    this.setElementAttributesDimensions(this.cardFaceElementService.getCardFaceElementDimensions(cardFaceElementPerCardFace));
  }

  private setElementAttributesDimensions(dimensions: Dimensions): void {
    this.cardEditorControlsDesignElementAttributesService.setElementAttributesDimensions(dimensions);
  }

  private onClickOperation(): void {
    this.cardEditorOperationsService.onClickOperations(this.cardEditorFacePreviewOperations, this.destroyRef);
  }

  private createCard(): void {
    this.cardFaceLodsService.setCardFaceThumbnailImages$(this.cardEditorFace, this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        switchMap(() => {
          if (this.cardEditorPreviewService.isNewCardEditorCardDto()) {
            return this.cardEditorOperationsService.createCardEditorCardDto$(this.cardEditorPreviewService.cardEditorCardDto).pipe(
              map(cardEditorCardDto => ({
                operation: 'create',
                cardEditorCardDto
              }))
            );
          } else {
            return this.cardEditorOperationsService.duplicateCardEditorCardDto$(this.cardEditorPreviewService.cardEditorCardDto, this.duplicateCardObservables(this.cardEditorPreviewService.cardEditorCardDto)).pipe(
              map(cardEditorCardDto => ({
                operation: 'duplicate',
                cardEditorCardDto
              }))
            );
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ operation, cardEditorCardDto }) => {
        if (!cardEditorCardDto) throw new Error(`${this.constructor.name}- ${this.createCard.name}: No card editor card dto`);

        if (operation !== 'create' && operation !== 'duplicate') throw new Error("Invalid operation");

        // CHECKME: We need to update the card editor card dto inside of cardEditorPreviewService here
        // TODO: Refactor the postOperations somehow?
        this.cardEditorPreviewService.postApiOperations(cardEditorCardDto, operation);
      });
  }

  // CHECKME: Is this being used correctly
  // CHECKME: Should this instead be an observable?
  private orphanFileMetadata(): void {
    this.fileMetadataService.orphan$.subscribe(() => {
      this.cardFaceLodsService.orphanFileMetadata();
      this.cardFaceElementImageService.orphanFileMetadata();
    })
  }

  private onCardEditorCardDtoOperations(): void {
    this.cardEditorApiService.onOperations(this.cardEditorCardDtoOperations);
  }

  private createdCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.setCurrentCardFaceId();
    this.configureCardFaceElements();
  }

  private updatedCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.configureCardFaceElements();
  }

  public shouldDeleteItems(cardFaceElementsPerCardFaceToDeleteIds: string[]): boolean {
    console.log(`%c${this.constructor.name} - ${this.shouldDeleteItems.name} (time: ${Date.now().toLocaleString("en-US")}):\ncardFaceElementsPerCardFaceToDeleteIds:${stringify(cardFaceElementsPerCardFaceToDeleteIds)}}`, `color: #457b9d; background: #f1faee; padding: 5px; border-radius: 5px;`);

    return cardFaceElementsPerCardFaceToDeleteIds.length > 0;
  }

  private saveCard(): void {
    this.cardFaceLodsService.setCardFaceThumbnailImages$(this.cardEditorFace, this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.getCurrentCardFaceIndex())
      .pipe(
        tap(() => console.log(`%c${this.constructor.name} - ${this.saveCard.name} (time: ${Date.now().toLocaleString("en-US")}) 1. Thumbnail images set`, `color: #344e41; background: #dad7cd; padding: 5px; border-radius: 5px;`)),
        // CHECKME: Do we actually want to delete the card face elements per card face here
        // TODO: Somehow figure out how you would actually do this in the backend in one call
        // Do we actually want to send the card editor card dto to the backend, grab all card face elements per card faces associated with the faces
        // Delete those, and just readd them? 
        switchMap(() =>
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

        tap(() => console.log(`%c${this.constructor.name} - ${this.saveCard.name} (time: ${Date.now().toLocaleString("en-US")}) 2. Delete operation completed`, `color: #450920; background: #f9dbbd; padding: 5px; border-radius: 5px;`)),
        switchMap(() => (this.cardEditorOperationsService.updateCardEditorCardDto$(this.cardEditorPreviewService.cardEditorCardDto))),

        tap(() => console.log(`%c${this.constructor.name} - ${this.saveCard.name} (time: ${Date.now().toLocaleString("en-US")}) 3. Update operation completed`, `color: #590d22; background: #fff0f3; padding: 5px; border-radius: 5px;`)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
        console.log(`%c${this.constructor.name} - ${this.saveCard.name} (time: ${Date.now().toLocaleString("en-US")}):\ncardFaceElementsPerCardFaceToDeleteIds:\n${stringify(this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds)}\ncardEditorCardDto:\n${stringify(cardEditorCardDto)}`, `color: #5D414D; background: #E5F6C6; padding: 5px; border-radius: 5px;`);

        if (cardEditorCardDto) {
          // CHECKME: We need to update the card editor card dto inside of cardEditorPreviewService here
          this.cardEditorPreviewService.postApiOperations(cardEditorCardDto, 'update');
        }
      });
  }

  protected onCardEditorFaceRightClick(event: MouseEvent): void {
    event.preventDefault();

    if (!this.actionContextMenuId) {
      this.actionContextMenuId = this.actionContextMenuService.open
        (
          this.actionContextMenuItems,
          (item: ActionContextMenuItem) => this.performAction(item),
          this.actionContextMenuService.getStyle
            (
              {
                x: event.clientX,
                y: event.clientY
              }
            ),
          () => this.resetActionContextMenuId(),
        );
    }
    else {
      this.actionContextMenuService.setStyle(
        this.actionContextMenuId,
        this.actionContextMenuService.getStyle
          (
            {
              x: event.clientX,
              y: event.clientY
            }
          )
      )
    }
  }

  private resetActionContextMenuId(): void {
    this.actionContextMenuId = '';
  }
  protected performAction(item: ActionContextMenuItem): void {
    switch (item.id) {
      case 0:
        this.importedCardFileInput.nativeElement.value = '';
        this.importedCardFileInput.nativeElement.click();
        break;
      default:
        item.action(this.cardEditorPreviewService.cardEditorCardDto);
        break;
    }
  }

  // TODO: Modify authentication method to make sure this would work with other instances
  protected importCard(event: Event): void {
    let input: HTMLInputElement = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let selectedFile: File = input.files[0];
      let fileReader: FileReader = new FileReader();

      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          let json: Object = JSON.parse(event.target?.result as string); // Parse file content as JSON
          if (!isCardEditorCardDto(json)) throw new Error("Didn't upload a card editor card dto");

          let cardEditorCardDto: CardEditorCardDto = json;
          this.actionContextMenuItems[0].action({ cardEditorCardDto, duplicateCardObservables: this.duplicateCardObservables(cardEditorCardDto) });
        } catch (e: any) {
          // Handle parse or validation errors
          console.error(e);
        }
      };

      fileReader.readAsText(selectedFile); // Actually read the file[8][2]
    }
  }

  private onCardFaceElementsPerCardFaceOperations(): void {
    unsubscription(this.cardFaceElementsPerCardFaceOperations$$);
    this.cardFaceElementsPerCardFaceOperations$$ = this.cardFaceElementService.onOperations(this.cardFaceElementsPerCardFaceOperations, this.destroyRef);
  }


  // TODO: Call this whenever signal is emitted from child, and child will emit and pass back the rect
  // TODO: Modify this to just handle the this.cardFaceElementService.createdCardFaceElementPerCardFace$
  private createdCardFaceElementPerCardFace(emitted: { type: string, dndPosition: DndPosition }): void {
    let { type, dndPosition } = emitted;

    this.setElementAttributes(
      this.cardFaceElementService.createCardFaceElementPerCardFace(
        {
          absolute: {
            x: dndPosition.x,
            y: dndPosition.y
          },
          rect: this.cardEditorCurrentCardFaceElementsPerCardFaceComponent.getCardFaceClientRect()
        },
        type,
        this.cardFaceElementsPerCardFace
      ));

    // FIXED: This should work
    // CHECKME: Make sure it doesn't affect everything else
    this.cardEditorPreviewService.setCurrentCardFaceElementsPerCardFace(this.cardFaceElementsPerCardFace);

    console.log(`%c${this.constructor.name} - ${this.createdCardFaceElementPerCardFace.name}:\nCard face elements per card face:${stringify(this.cardFaceElementsPerCardFace)}\nCard editor card dto:\n${stringify(this.cardEditorPreviewService.cardEditorCardDto)}`, `color: #19183B; background: #E7F2EF; padding: 5px; border-radius: 5px;`);

    // ASSUMPTION: The latest card face element per card face will always be the last of the index
    // this.clampNewCardFaceElementPerCardFacePosition();
  }

  private configureCardFaceElements(): void {
    this.setCardFaceElementsPerCardFace();
    this.resetElementAttributes();
    this.onCardFaceElementsPerCardFaceOperations();
  }

  private setCardEditorCardDto(): void {
    this.cardEditorPreviewService.setCardEditorCardDto$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.configureCardFaceElements();
      });
  }

  // CHECKME: Instead of these being subscribables, might want to make it so that in the currentCardFaceElementsPerCardFace, you have output signals
  // Then call then which will then call the subscribables
  protected enableRte(emitted: { id: string, text: string }): void {
    this.cardEditorControlsDesignImageService.closeCardFaceImageEditor();
    this.setElementAttributes(emitted.id);
  }

  // FIXME: Can't delete card face element per card face
  private deletedCardFaceElementPerCardFace(emitted: string): void {
    this.cardEditorPreviewService.setCurrentCardFaceElementsPerCardFace(this.cardFaceElementService.deleteCardFaceElementPerFace(emitted, this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace()));
    if (!this.cardEditorPreviewService.isNewCardEditorCardDto() && this.cardFaceElementService.doesCardFaceElementPerCardFaceToDeleteExistInDatabase(emitted)) this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds.push(emitted);

    this.setCardFaceElementsPerCardFace();
    this.resetElementAttributes();

    console.log(`
        %c${this.constructor.name} - ${this.deletedCardFaceElementPerCardFace.name}:\nCard face element per face ID: ${emitted}
        \n${stringify(this.cardFaceElementService.cardFaceElementsPerCardFaceToDeleteIds)}
      `, 'color: #f95401; background: #fffdf3; padding: 5px; border-radius: 5px;');

    // CHECKME: Do we call a subject here like in the original code for this?
  }

  private setSrc(src: string): void {
    let element: {
      cardFaceElementId: string,
      cardFaceElementsPerCardFace: CardFaceElementPerCardFace[],
      cardFaceElementService: CardFaceElementService
    } = {
      cardFaceElementId: this.cardFaceElementId,
      cardFaceElementsPerCardFace: this.cardFaceElementsPerCardFace,
      cardFaceElementService: this.cardFaceElementService
    }

    this.cardFaceElementImageService.setSrc(src, element);
  }

  private onImageEditorStatusToggle(): void {
    this.cardEditorControlsDesignImageService.onStatusToggle(this.imageEditorStatusOperations, this.destroyRef);
  }

  private onRteStatusToggle(): void {
    this.cardEditorControlsDesignRteService.onStatusToggle(this.rteStatusOperations, this.destroyRef);
  }

  private enableImageEditor(id: string): void {
    this.cardEditorControlsDesignImageService.displayCardFaceImageEditor();
    this.setElementAttributes(id);
  }

  private uploadmage(src: string): void {
    if (!src || !this.cardFaceElementImageService.isImage(this.cardFaceElementId, this.cardFaceElementsPerCardFace, this.cardFaceElementService)) return;

    this.setSrc(src);
    this.disableImageEditor(src);
  }

  private disableImageEditor(src: string): void {
    this.cardEditorControlsDesignImageService.closeCardFaceImageEditor();
  }

  protected onRteTextChange(): void {
    this.cardEditorControlsDesignRteService.onRteTextChange((text: string) => this.cardFaceElementRtService.setRt(this.cardFaceElementId, text, this.cardFaceElementsPerCardFace, this.cardFaceElementService));
  }
}