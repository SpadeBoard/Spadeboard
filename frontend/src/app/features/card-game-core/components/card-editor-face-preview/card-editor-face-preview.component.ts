import { DragDropModule } from '@angular/cdk/drag-drop';

import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { ActionContextMenuService } from '../../../actions-context-menu/services/action-context-menu.service';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { Style } from '../../../style/models/style';
import { CardEditorCardDto } from '../../models/card';
import { CardFaceElementImage, CardFaceElementPerCardFace } from '../../models/card-face-element';
import { CardEditorApiService } from '../../services/card-game-core/card-editor/api/card-editor-api.service';
import { CardEditorOperationsService } from '../../services/card-game-core/card-editor/operations/card-editor-operations.service';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardFaceEditorPreviewAttributesService } from '../../services/card-game-core/card-face/preview/attributes/card-face-editor-preview-attributes.service';
import { CardFaceEditorPreviewElementsService } from '../../services/card-game-core/card-face/preview/elements/card-face-editor-preview-elements.service';
import { CardEditorFacePreviewFileMetadataService } from '../../services/card-game-core/card-face/preview/file-metadata/card-editor-face-preview-file-metadata.service';
import { CardEditorFacePreviewFlipService } from '../../services/card-game-core/card-face/preview/flip/card-editor-face-preview-flip.service';
import { CardEditorFacePreviewOperationsService } from '../../services/card-game-core/card-face/preview/operations/card-editor-face-preview-operations.service';
import { DEFAULT_CARD_FACE_BORDER_RADIUS } from '../../utils/card-editor.constants';
import { isCardEditorCardDto } from '../../utils/card-game-core.utils';
import { CardEditorCurrentCardFaceElementsPerCardFaceComponent } from '../card-editor-current-card-face-elements-per-card-face/card-editor-current-card-face-elements-per-card-face.component';
import { CardEditorFacePreviewGridComponent } from './card-editor-face-preview-grid/card-editor-face-preview-grid.component';

@Component({
  selector: 'app-card-editor-face-preview',
  providers: [
    // TODO: Figure out if these specializes services should be manually provided instead of having providedIn: 'root' at all
    CardFaceEditorPreviewAttributesService,
    CardEditorFacePreviewOperationsService,
    CardFaceEditorPreviewElementsService,
    CardEditorFacePreviewFlipService
  ],
  imports: [
    DragDropModule,
    CardEditorFacePreviewGridComponent,
    CardEditorCurrentCardFaceElementsPerCardFaceComponent
  ],
  templateUrl: './card-editor-face-preview.component.html',
  styleUrl: './card-editor-face-preview.component.scss'
})
export class CardEditorFacePreviewComponent implements AfterViewInit {
  /****************************** SERVICES **************************************/
  private readonly cardEditorFacePreviewFileMetadataService: CardEditorFacePreviewFileMetadataService = inject(CardEditorFacePreviewFileMetadataService);

  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);

  private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);

  private readonly actionContextMenuService: ActionContextMenuService = inject(ActionContextMenuService);

  private readonly cardFaceEditorPreviewAttributesService: CardFaceEditorPreviewAttributesService = inject(CardFaceEditorPreviewAttributesService);

  protected readonly cardFaceEditorPreviewElementsService: CardFaceEditorPreviewElementsService = inject(CardFaceEditorPreviewElementsService);

  private readonly cardEditorFacePreviewOperationsService: CardEditorFacePreviewOperationsService = inject(CardEditorFacePreviewOperationsService);

  private readonly cardEditorFacePreviewFlipService: CardEditorFacePreviewFlipService = inject(CardEditorFacePreviewFlipService);
  /****************************** SERVICES **************************************/

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private processFlipOperations: Map<string, Function> = new Map<string, Function>([
    ['on', () =>
      this.cardEditorFacePreviewFlipService.onFlip(
        this.cardEditorFace,
        this.destroyRef,
        this.cardFaceEditorPreviewAttributesService.getCurrentCardFaceStyle()
      )
    ],
    ['post', () => this.cardEditorFacePreviewFlipService.postFlip(
      this.cardFaceEditorPreviewAttributesService,
      this.cardFaceEditorPreviewElementsService,
      this.destroyRef
    )]
  ])

  private cardEditorCardDtoOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (cardEditorCardDto: CardEditorCardDto) => this.createdCardEditorCardDto(cardEditorCardDto, this.cardFaceEditorPreviewAttributesService, this.cardFaceEditorPreviewElementsService)],
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.updatedCardEditorCardDto(cardEditorCardDto, this.cardFaceEditorPreviewAttributesService, this.cardFaceEditorPreviewElementsService)]
  ])

  private cardFaceElementsPerCardFaceOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (emitted: { type: string, dndPosition: DndPosition }) => this.cardEditorFacePreviewOperationsService.createdCardFaceElementPerCardFace(emitted, this.cardFaceEditorPreviewElementsService, this.cardEditorCurrentCardFaceElementsPerCardFaceComponent.getCardFaceClientRect(), this.destroyRef)],
    ['delete', (emitted: string) => this.cardEditorFacePreviewOperationsService.deletedCardFaceElementPerCardFace(emitted, this.cardFaceEditorPreviewElementsService, this.destroyRef)]
  ]);

  private imageEditorStatusOperations: Map<string, Function> = new Map<string, Function>([
    ['upload', (src: string) => this.cardFaceEditorPreviewElementsService.uploadImage(
      src,
      (src: string): void => {
        // FIXME: Why must the subscription be here, and it can't be inside the service itself?
        // Potentially gotta do with DestroyRef? Maybe assign DestroyRef in the service
        this.cardFaceEditorPreviewElementsService.setSrc$(src, this.destroyRef)
          .subscribe((cardFaceElementImage: CardFaceElementImage) => {
            let idx: number = this.cardFaceEditorPreviewElementsService.$currentCardFaceElementsPerCardFace().findIndex((e: CardFaceElementPerCardFace) => e.cardFaceElement.cardFaceElementId === cardFaceElementImage.cardFaceElementId);

            if (idx === -1) throw new Error();

            this.cardFaceEditorPreviewElementsService.setCardFaceElementPerCardFaceImage(cardFaceElementImage, idx);

            /*let updated: CardFaceElementPerCardFace[] = [...this.cardFaceEditorPreviewElementsService.$currentCardFaceElementsPerCardFace()];
      
            updated[idx] = {
              ...updated[idx],
              cardFaceElement: cardFaceElementImage
            };*/

            this.cardFaceEditorPreviewElementsService.setCardFaceElementPerCardFaceImages(this.destroyRef)
          });

        this.cardFaceEditorPreviewElementsService.disableImageEditor();
      })],
    ['disable', (src: string) => this.cardFaceEditorPreviewElementsService.disableImageEditor()]
  ]);

  /******************** SIGNALS *************************/
  protected shouldSnapToGrid: boolean = false;

  // TODO: Have action context menu items be groupable
  protected actionContextMenuItems: ActionContextMenuItem[] = [];

  protected cardFaceBorderRadius: number = DEFAULT_CARD_FACE_BORDER_RADIUS;
  //************************************************************************/

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

    this.cardFaceEditorPreviewAttributesService.setCurrentCardFaceId();

    this.cardEditorOperationsService.onProcessFlip(this.processFlipOperations, this.destroyRef);

    this.configureFileMetadataService();

    this.cardEditorApiService.onOperations(this.cardEditorCardDtoOperations, this.destroyRef);

    this.cardFaceEditorPreviewElementsService.setCardFaceElementsPerCardFaceOperations$$(this.cardFaceElementsPerCardFaceOperations, this.destroyRef);

    this.cardFaceEditorPreviewElementsService.rteTextChange(this.destroyRef);

    this.cardFaceEditorPreviewElementsService.imageEditorStatusToggle(
      this.imageEditorStatusOperations,
      this.destroyRef
    );
  }

  public ngAfterViewInit(): void {
    // console.log(`After view init cef preview component: ${JSON.stringify(this.cardEditorFace.nativeElement)}`);
    this.getCardEditorFaceStyle();

    this.cardFaceEditorPreviewAttributesService.setCardFaceAppearanceAttributes(this.destroyRef);

    this.cardEditorOperationsService.onClickOperations(
      this.cardEditorFacePreviewOperationsService.cardEditorFacePreviewOperations,
      this.destroyRef,
      {
        cardEditorFace: this.cardEditorFace,
        cardFaceEditorPreviewAttributesService: this.cardFaceEditorPreviewAttributesService
      });
  }

  private configureFileMetadataService(): void {
    this.cardEditorFacePreviewFileMetadataService.orphanFileMetadata(this.destroyRef);
    this.cardEditorFacePreviewFileMetadataService.clearOrphanedFileMetadata(this.destroyRef);
  }

  // TODO: Move into another service
  // TODO: Rename this or split this
  public setCardFaceElementsPerCardFace(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    this.cardFaceEditorPreviewElementsService.setCardFaceElementsPerCardFace(cardFaceElementsPerCardFace, this.destroyRef);
  }

  protected getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return this.cardFaceEditorPreviewAttributesService.getCardEditorFaceStyle();
  }

  public setCurrentCardFaceStyle(style: Style): void {
    this.cardFaceEditorPreviewAttributesService.setCurrentCardFaceStyle(style);
  }

  private createdCardEditorCardDto(cardEditorCardDto: CardEditorCardDto, cardFaceEditorPreviewAttributesService: CardFaceEditorPreviewAttributesService, cardFaceEditorPreviewElementsService: CardFaceEditorPreviewElementsService): void {
    cardFaceEditorPreviewAttributesService.setCurrentCardFaceId();
    cardFaceEditorPreviewAttributesService.setCurrentCardFaceStyle(this.cardEditorPreviewService.getCurrentCardFaceStyle());

    cardFaceEditorPreviewElementsService.configureCardFaceElements(
      this.cardFaceElementsPerCardFaceOperations,
      this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace(),
      this.destroyRef
    );
  }

  private updatedCardEditorCardDto(cardEditorCardDto: CardEditorCardDto, cardFaceEditorPreviewAttributesService: CardFaceEditorPreviewAttributesService, cardFaceEditorPreviewElementsService: CardFaceEditorPreviewElementsService): void {
    cardFaceEditorPreviewAttributesService.setCurrentCardFaceStyle(this.cardEditorPreviewService.getCurrentCardFaceStyle());

    cardFaceEditorPreviewElementsService.configureCardFaceElements(
      this.cardFaceElementsPerCardFaceOperations,
      this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace(),
      this.destroyRef
    );
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
          this.actionContextMenuItems[0].action({
            cardEditorCardDto,
            duplicateCardObservables: this.cardEditorFacePreviewOperationsService.duplicateCardObservables$(cardEditorCardDto, this.destroyRef),
            destroyRef: this.destroyRef
          });
        } catch (e: any) {
          // Handle parse or validation errors
          console.error(e);
        }
      };

      fileReader.readAsText(selectedFile); // Actually read the file[8][2]
    }
  }

  // CHECKME: Is this necessary
  private setCardEditorCardDto(): void {
    this.cardEditorPreviewService.setCardEditorCardDto$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.cardFaceEditorPreviewAttributesService.setCurrentCardFaceStyle(this.cardEditorPreviewService.getCurrentCardFaceStyle());
        
        this.cardFaceEditorPreviewElementsService.configureCardFaceElements(
          this.cardFaceElementsPerCardFaceOperations,
          this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace(),
          this.destroyRef
        );
      });
  }

  protected setElementAttributes(cardFaceElementId: string): void {
    this.cardFaceEditorPreviewElementsService.setElementAttributes(cardFaceElementId, this.destroyRef);
  }

  protected enableElement(cardFaceElementId: string, type: string): void {
    this.cardFaceEditorPreviewElementsService.enableElement(cardFaceElementId, type, this.destroyRef);
  }

  protected enableImageEditor(cardFaceElementId: string): void {
    this.cardFaceEditorPreviewElementsService.enableImageEditor(
      cardFaceElementId,
      this.destroyRef
    );
  }
}