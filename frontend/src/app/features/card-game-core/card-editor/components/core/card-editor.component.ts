import { AfterViewInit, Component, DestroyRef, ElementRef, inject, input, InputSignal, model, ModelSignal, output, OutputEmitterRef, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TagData } from '@yaireo/tagify';
import { BehaviorSubject, catchError, combineLatest, EMPTY, map, Observable, Subscription, switchMap } from 'rxjs';
import { ActionContextMenuItem } from '../../../../../shared/actions/models/action-context-menu-item';
import { ActionContextMenuService } from '../../../../../shared/actions/services/action-context-menu.service';
import { Coordinates, Dimensions, logInfo, parseNumeric, stringify } from '../../../../../utils/utils';
import { DndPosition } from '../../../../drag-and-drop/models/dnd-position';
import { BorderDimensions, Style } from '../../../../style/models/style';
import { Tag } from '../../../../tagging-system/models/tag';
import { TagApiService } from '../../../../tagging-system/services/tag-api.service';
import { UserService } from '../../../../user/service/user.service';
import { CardActionsService } from '../../../card-actions/service/card-actions.service';
import { CardEditorInfoComponent } from '../../../card-editor-info/component/card-editor-info.component';
import { CardFaceElementPerCardFace } from '../../../card-face-element/models/card-face-element';
import { Card } from '../../../card/models/card';
import { CardEditorPreviewComponent } from '../../../components/card-editor-preview/card-editor-preview.component';
import { isCardEditorCardDto } from '../../../utils/card-game-core.utils';
import { DEFAULT_CARD_FACE_BACKGROUND_COLOR, DEFAULT_CARD_FACE_BORDER_COLOR, DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CARD_FACE_BORDER_WIDTH, DEFAULT_CARD_FACE_HEIGHT, DEFAULT_CARD_FACE_WIDTH, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH, MIN_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../constants/card-editor.constants';
import { CardEditorControlsComponent } from '../../controls/core/card-editor-controls.component';
import { CardEditorCardDto } from '../../models/card-editor-card-dto';
import { CardEditorFacadeService } from '../../services/facade/card-editor-facade.service';
import { CardEditorCloseComponent } from '../close/card-editor-close.component';

// TODO: Resizable card face, have arrows for dragging, make sure there's a max width/height for that card face
@Component({
  selector: 'app-card-editor',
  imports: [
    AngularEditorModule,
    FormsModule,
    CommonModule,

    CardEditorPreviewComponent,
    CardEditorControlsComponent,
    CardEditorCloseComponent,
    CardEditorInfoComponent
  ],
  templateUrl: './card-editor.component.html',
  styleUrl: './card-editor.component.scss'
})
export class CardEditorComponent implements AfterViewInit {
  @ViewChild('importedCardFileInput') importedCardFileInput: ElementRef<HTMLInputElement>= {} as ElementRef<HTMLInputElement>;

  private readonly tagApiService: TagApiService = inject<TagApiService>(TagApiService);

  // TODO: Potential make a cardEditorControlsService instead and put it in the cardEditorFacadeService or put it separately

  private readonly cardEditorFacadeService: CardEditorFacadeService = inject<CardEditorFacadeService>(CardEditorFacadeService);

  private readonly actionContextMenuService: ActionContextMenuService = inject<ActionContextMenuService>(ActionContextMenuService);

  private readonly cardActionsService: CardActionsService = inject<CardActionsService>(CardActionsService);

  private readonly userService: UserService = inject<UserService>(UserService);

  /****************************************/

  protected readonly $handleClose: OutputEmitterRef<void> = output<void>();

  private collectionContextCardId: string = '';

  protected cardEditorPreviewTags: TagData[] = [];

  protected whitelist$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  protected cardTemplates: Card[] = [];

  private readonly destroyRef: DestroyRef = inject<DestroyRef>(DestroyRef);

  private cardEditorFace: ElementRef | undefined;

  private processOperationsHandlers: Map<string, Function> = new Map<string, Function>([
    ['create', (
      args: {
        cardEditorFace: ElementRef,
        destroyRef: DestroyRef
      }
    ) => {
      this.cardEditorFacadeService.processUpsertCard(
        args.cardEditorFace,
        args.destroyRef
      );

      // TODO: Disable the RTE here and clear it
    }],
    ['save', (
      args: {
        cardEditorFace: ElementRef,
        destroyRef: DestroyRef
      }
    ) => {
      this.cardEditorFacadeService.processSaveCard(
        args.cardEditorFace,
        args.destroyRef);
    }]
  ]);

  private processFlipOperations: Map<string, Function> = new Map<string, Function>([
    ['on', () => {
      this.cardEditorFacadeService.activateFlip(
        this.getCardEditorFace(),
        this.destroyRef);
    }
    ],
    ['post', () => {
      this.cardEditorFacadeService.toggleCurrentCardFace();
      
      this.setCardFaceAttributes();

      this.cardEditorFacadeService.setElementsAttributes(this.destroyRef); // Ok, we really need to name these better...

      this.cardEditorFacadeService.resetElementAttributes(
        this.$cardFaceElementWidth,
        this.$cardFaceElementHeight,
        this.$cardFaceElementX,
        this.$cardFaceElementY
      );
    }
    ]
  ]);

  // CHECKME: Do we need these handlers, or do we just set the card templates in setCardEditorCardDto
  private completedOperationsHandlers: Map<string, Function> = new Map<string, Function>([
    ['create', (cardEditorCardDto: CardEditorCardDto) => {
      this.cardEditorFacadeService.addCardTemplate(cardEditorCardDto, this.cardTemplates);
    }],
    ['update', (cardEditorCardDto: CardEditorCardDto) => {
      this.cardTemplates = this.cardEditorFacadeService.updateCardTemplate(cardEditorCardDto, this.cardTemplates);
    }],
    ['delete', (cardId: string) => {
      this.cardTemplates = this.cardEditorFacadeService.removeCardTemplate(cardId, this.cardTemplates);
    }]
  ]);

  private imageEditorStatusOperations: Map<string, Function> = new Map<string, Function>([
    ['upload', (src: string) => this.cardEditorFacadeService.uploadImage(src, this.destroyRef)],
    ['disable', (src: string) => this.cardEditorFacadeService.disableImageEditor()]
  ]);

  protected actionContextMenuItems: ActionContextMenuItem[] = [];

  private actionContextMenuId: string = '';

  //https://medium.com/netanelbasal/converting-signals-to-observables-in-angular-what-you-need-to-know-971eacd3af2
  protected $cardFaceHexcode: ModelSignal<string> = model<string>(DEFAULT_CARD_FACE_BACKGROUND_COLOR);

  // TODO: Convert to observable?
  private readonly cardFaceHexcode$: Observable<string> = toObservable<string>(this.$cardFaceHexcode);

  protected $borderHexcode: ModelSignal<string> = model<string>(DEFAULT_CARD_FACE_BORDER_COLOR);

  private readonly borderHexcode$: Observable<string> = toObservable<string>(this.$borderHexcode);

  protected $borderRadius: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_BORDER_RADIUS);

  private readonly borderRadius$: Observable<number> = toObservable<number>(this.$borderRadius);

  protected $cardFaceWidth: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_WIDTH);

  private readonly cardFaceWidth$: Observable<number> = toObservable<number>(this.$cardFaceWidth);

  protected $cardFaceHeight: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_HEIGHT);

  private readonly cardFaceHeight$: Observable<number> = toObservable<number>(this.$cardFaceHeight);

  protected $borderDimensions: ModelSignal<BorderDimensions> = model<BorderDimensions>({
    borderWidth: DEFAULT_CARD_FACE_BORDER_WIDTH,
    borderRect: {
      top: DEFAULT_CARD_FACE_BORDER_WIDTH,
      bottom: DEFAULT_CARD_FACE_BORDER_WIDTH,
      left: DEFAULT_CARD_FACE_BORDER_WIDTH,
      right: DEFAULT_CARD_FACE_BORDER_WIDTH
    }
  });

  private readonly borderDimensions$: Observable<BorderDimensions> = toObservable<BorderDimensions>(this.$borderDimensions);

  protected $cardFaceElementWidth: ModelSignal<number> = model<number>(0);

  private readonly cardFaceElementWidth$: Observable<number> = toObservable<number>(this.$cardFaceElementWidth);

  protected $cardFaceElementHeight: ModelSignal<number> = model<number>(0);

  private readonly cardFaceElementHeight$: Observable<number> = toObservable<number>(this.$cardFaceElementHeight);

  protected $cardFaceElementX: ModelSignal<number> = model<number>(0);

  private readonly cardFaceElementX$: Observable<number> = toObservable<number>(this.$cardFaceElementX);

  protected $cardFaceElementY: ModelSignal<number> = model<number>(0);

  private readonly cardFaceElementY$: Observable<number> = toObservable<number>(this.$cardFaceElementY);

  protected areBorderDimensionsEqual: boolean = false;

  public readonly $editable: InputSignal<boolean> = input<boolean>(true); // TODO: Use this in the future for a lot of stuff, probably the user can open a card but don't have permissions to edit it

  protected minCardFaceWidth: number = MIN_CARD_FACE_WIDTH; // TODO: Make sure this is always big enough to fit the elements, pass this down to the children

  protected minCardFaceHeight: number = MIN_CARD_FACE_HEIGHT; // TODO: Make sure this is always big enough to fit the elements, pass this down to the children

  protected maxCardFaceElementWidth: number = MAX_CARD_FACE_WIDTH;

  protected maxCardFaceElementHeight: number = MAX_CARD_FACE_HEIGHT;

  protected maxCardFaceElementX: number = MAX_CARD_FACE_WIDTH;

  protected maxCardFaceElementY: number = MAX_CARD_FACE_HEIGHT;

  private initialElementDimensions: Dimensions = {
    width: 0,
    height: 0
  }

  protected readonly $aspectRatioLocked: ModelSignal<boolean> = model<boolean>(true);

  private readonly aspectRatioLocked$: Observable<boolean> = toObservable<boolean>(this.$aspectRatioLocked);

  // TODO: For min and max values of element dimensions and position, make sure to update based on whether the size of the card face height and width changes, you have to think about the offset as well

  // TODO: Refactor some of these lines to be in their own functions, group them by component they affect?
  constructor() {
    this.cardEditorFacadeService.getCardTemplates(this.cardTemplates);

    this.refreshWhitelist();

    this.setCardEditorCardDto(this.destroyRef);

    this.cardEditorFacadeService.subscribeToFlip(this.processFlipOperations, this.destroyRef);

    this.cardEditorFacadeService.subscribeToCompletedOperations(this.completedOperationsHandlers, this.destroyRef);

    this.configureFileMetadataService(this.destroyRef);

    // TODO: Refactor with the service, make the model signals and observables into the service
    this.cardFaceHexcode(this.destroyRef);
    this.borderHexcode(this.destroyRef);
    this.borderRadius(this.destroyRef);
    this.borderDimensions(this.destroyRef);
    this.cardFaceDimensions(this.destroyRef);

    this.cardFaceElementDimensions(this.destroyRef);
    this.cardFaceElementPosition(this.destroyRef);

    this.aspectRatioLocked(this.destroyRef);

    this.cardEditorFacadeService.rteTextChange(this.destroyRef);

    this.cardEditorFacadeService.imageEditorStatusToggle(this.imageEditorStatusOperations, this.destroyRef);
  }

  public ngAfterViewInit(): void {
    this.cardEditorFacadeService.activateOperationsSubscription(
      this.processOperationsHandlers,
      this.destroyRef,
      {
        cardEditorFace: this.getCardEditorFace()
      });
  }

  protected isFlipped(): boolean {
    return this.cardEditorFacadeService.isFlipped();
  }

  protected getCardName(): string {
    return this.cardEditorFacadeService.getCardName();
  }

  protected changeCardName(cardName: string): void {
    this.cardEditorFacadeService.changeCardName(cardName);
  }

  private configureFileMetadataService(destroyRef: DestroyRef): void {
    this.cardEditorFacadeService.orphan(destroyRef);
    this.cardEditorFacadeService.clear(destroyRef);
  }

  protected getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return this.cardEditorFacadeService.getCardEditorFaceStyle();
  }

  private setCardEditorCardDto(destroyRef: DestroyRef): void {
    this.cardEditorFacadeService.setCardEditorCardDto$()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        this.cardEditorPreviewTags = this.cardEditorFacadeService.populateTags();

        this.setCardFaceAttributes();

        this.cardEditorFacadeService.setElementsAttributes(destroyRef);

        this.cardEditorFacadeService.resetElementAttributes(
          this.$cardFaceElementWidth,
          this.$cardFaceElementHeight,
          this.$cardFaceElementX,
          this.$cardFaceElementY
        );
      })
  }

  protected handleCardCreate(): void {
    this.cardEditorFacadeService.activateCreateCard(this.userService.$userId());
  }

  protected hasCreated(): boolean {
    return this.cardEditorFacadeService.hasCreated();
  }

  protected handleCardSave(): void {
    this.cardEditorFacadeService.activateSaveCard();
  }

  protected handleClose(): void {
    this.$handleClose.emit();
  }

  protected activateFlip(): void {
    this.cardEditorFacadeService.triggerFlip();
  }

  protected tag(tagInfo: {
    operation: 'create' | 'update' | 'delete',
    tag: Tag,
    idx?: number
  }): void {
    let { operation, tag, idx } = tagInfo;
    switch (operation) {
      case 'create':
        this.createTag(tag);
        break;
      case 'update':
        if (idx) this.updateTag(tag, idx);
        break;
      case 'delete':
        this.deleteTag(tag);
        break;
    }
  }

  private createTag(tag: Tag): void {
    this.tagApiService.getTagByTagName$(tag.tagName)
      .pipe(
        switchMap((existing: Tag | undefined) => {
          if (existing) {
            this.cardEditorFacadeService.addTag(existing);

            console.log(`%c${logInfo(this.constructor.name, this.createTag.name)} - tag already exists: ${stringify(existing)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;');

            return EMPTY;
          }
          else {
            return this.tagApiService.createTag$(tag);
          }
        }),
        catchError((err: any) => {
          if (err.status === 404) return this.tagApiService.createTag$(tag);
          else {
            console.warn('Error fetching tag:', err);
            return EMPTY;
          }
        })
      )
      .subscribe((created: Tag | undefined) => {
        if (!created) {
          console.warn('Tag could not be created.');
          return;
        }

        this.cardEditorFacadeService.addTag(created);

        this.refreshWhitelist();

        console.log(`%c${logInfo(this.constructor.name, this.createTag.name)} - tag has been created: ${stringify(created)}`, 'color: #003844; background: #FFEBC6; padding: 5px; border-radius: 5px;');
      });
  }

  private updateTag(tag: Tag, idx: number): void {
    this.tagApiService.getTagByTagName$(tag.tagName)
      .pipe(
        switchMap((existing: Tag | undefined) => {
          if (existing) {
            this.cardEditorFacadeService.updateTag(idx, existing);

            console.log(`%c${logInfo(this.constructor.name, this.updateTag.name)} - tag already exists: ${stringify(existing)}`, 'color: #692b49; background: #c3eee9; padding: 5px; border-radius: 5px;');

            return EMPTY;
          }
          else {
            return this.tagApiService.createTag$(tag);
          }
        }),
        catchError((err: any) => {
          if (err.status === 404) {
            return this.tagApiService.createTag$(tag);
          }
          else {
            console.warn('Error fetching tag:', err);
            return EMPTY;
          }
        })
      )
      .subscribe((created: Tag | undefined) => {
        if (!created) {
          console.warn('Tag could not be created.');
          return;
        }

        this.cardEditorFacadeService.updateTag(idx, created);

        this.refreshWhitelist();

        console.log(`%c${logInfo(this.constructor.name, this.updateTag.name)} - tag has been created: ${stringify(created)}`, 'color: #692b49; background: #c3eee9; padding: 5px; border-radius: 5px;');
      });
  }

  private deleteTag(tag: Tag): void {
    this.cardEditorFacadeService.deleteTag(tag);
  }

  private refreshWhitelist(): void {
    this.tagApiService.getTagNames$().subscribe((tagNames: string[] | undefined) => {
      if (!tagNames)
        return;

      this.whitelist$$.next(tagNames);
    });
  }

  protected getCurrentEditedCardId(): string {
    return this.cardEditorFacadeService.getCurrentCardId();
  }

  protected getCurrentCardFaceElementId(): string {
    return this.cardEditorFacadeService.$currentCardFaceElementId();
  }

  protected selectCard(cardId: string): void {
    this.cardEditorFacadeService.setCardEditorCardDtoByCardId(cardId);
  }

  protected deleteCard(cardId: string): void {
    this.cardEditorFacadeService.deleteCard(cardId);
  }

  protected setCardEditorFace(cardEditorFace: ElementRef): void {
    this.cardEditorFace = cardEditorFace;
  }

  public getCardEditorFace(): ElementRef {
    if (this.cardEditorFace) return this.cardEditorFace;

    throw Error(`${logInfo(this.constructor.name, this.getCardEditorFace.name)}: no card editor face element ref`);
  }

  public getCardFaceClientRect(): DOMRect {
    if (!this.cardEditorFace) {
      throw new Error('cardEditorFace is not available!');
    }

    return this.cardEditorFace.nativeElement.getBoundingClientRect();
  }

  protected setElementAttributes(cardFaceElementId: string): void {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = this.cardEditorFacadeService.getCardFaceElementPerCardFace(
      cardFaceElementId,
      this.cardEditorFacadeService.getCurrentCardFaceElementsPerCardFace()
    );

    this.cardEditorFacadeService.$currentCardFaceElementId.set(cardFaceElementId);

    let { width, height } = this.cardEditorFacadeService.getCardFaceElementPerCardFaceDimensions(cardFaceElementPerCardFace);

    this.$cardFaceElementWidth.set(width);
    this.$cardFaceElementHeight.set(height);

    let { x, y } = this.cardEditorFacadeService.getCardFaceElementPerCardFacePosition(cardFaceElementPerCardFace);

    this.$cardFaceElementX.set(x);
    this.$cardFaceElementY.set(y);

    this.setInitialElementDimensions({width, height});

    // CHECKME - FIXME: These don't update automatically, do we also have to clamp the resizing?

    // CHECKME: We put it in this order so it doesn't accidentally correct itself if let's say the card face element's out of bounds due to the card face already being modified beforehand
    this.constrainCardFace({width, height});

    this.constrainCardFaceElement({width, height});
  }

  private constrainCardFace(dimensions: Dimensions): void {
    // TODO: If dimensions of the card face element is larger than the card face width and card face height, update the card face width and card face height immediately
    if (dimensions.width > this.$cardFaceWidth()) {
      this.$cardFaceWidth.set(dimensions.width);
      
      this.minCardFaceWidth =  this.$cardFaceWidth(); // TODO: Actually pass this down?
    }

    if (dimensions.height > this.$cardFaceHeight()) {
      this.$cardFaceHeight.set(dimensions.height);

      this.minCardFaceHeight = this.$cardFaceHeight(); // TODO: Actually pass this down?
    }

  }

  // FIXME: Gotta fix the max somehow here, something's off about the offset
  private constrainCardFaceElement(dimensions: Dimensions): void {
    this.maxCardFaceElementX = (this.$cardFaceWidth() - dimensions.width > 0) ? this.$cardFaceWidth() - dimensions.width : 0; // CHECKME: Do we reset this when we also reset the card face element attributes?
    this.maxCardFaceElementY = (this.$cardFaceHeight() - dimensions.height > 0) ? this.$cardFaceHeight() - dimensions.height : 0; // CHECKME: Do we reset this when we also reset the card face element attributes?
  }

  protected setElementPosition(coordinates: Coordinates): void {
    // CHECKME: Do we constarain here first? Use  let clamped: Coordinates = this.cardFaceElementDndService.getClampedCoordinates(drop, this.getCardFaceClientRect(), this.dragOffset, this.$shouldSnapToGrid(), this.getCardFaceElementDimensions(cardFaceElementId)); instead?

    this.cardEditorFacadeService.setElementPosition(
      coordinates, 
      this.cardEditorFacadeService.$currentCardFaceElementId()
    );

    this.$cardFaceElementX.set(coordinates.x);
    this.$cardFaceElementY.set(coordinates.y);
  }


  // https://medium.com/@groupp/effective-debouncing-in-angular-keep-signals-pure-703eb105a495
  // FIXME: Need to refactor 
  // Debounce needs to sit before the signal, not inside or on it. Signals result from some input; they should reflect the already-processed (i.e., debounced) value. Trying to bolt debounce onto a signal treats it like an observable stream, which it simply isn’t.

  // FIXME: Why isn't this working properly with the element inputs
  // Wonder if the debounce is indeed the issue, because it's passing up the dimensions way too fast?
  // Remove the change functions, perhaps we got to set the proportional dimensions directly inside of the element position, which isn't exactly ideal but it might be a necessity
  protected setElementDimensions(dimensions: Dimensions): void {
    if (this.$aspectRatioLocked()) 
      dimensions = this.cardEditorFacadeService.setProportionalDimensions(this.initialElementDimensions, dimensions);

    console.log(`${stringify(dimensions)}`);

    this.$cardFaceElementWidth.set(dimensions.width);
    this.$cardFaceElementHeight.set(dimensions.height);
  }

  protected enableElement(element: { cardFaceElementId: string, type: string }): void {
    let { cardFaceElementId, type } = element;

    this.cardEditorFacadeService.enableElement(cardFaceElementId, type);

    this.setElementAttributes(cardFaceElementId);
  }

  protected enableImageEditor(cardFaceElementId: string): void {
    this.cardEditorFacadeService.enableImageEditor();
  }

  private aspectRatioLocked(destroyRef: DestroyRef): Subscription {
    return this.aspectRatioLocked$.pipe(
      takeUntilDestroyed(destroyRef)
    ).subscribe((locked: boolean) => {
      if (locked) {
        this.setInitialElementDimensions({width: this.$cardFaceElementWidth(), height: this.$cardFaceElementHeight()});
      }
    })
  }

  private setInitialElementDimensions(dimensions: Dimensions): void {
    this.initialElementDimensions = dimensions;
  }
  
  /**************************************************/

  private setActionContextMenuItems(menu: 'Preview' | 'Templates'): void {
    switch (menu) {
      case 'Preview':
        this.actionContextMenuItems = this.cardActionsService.getPreviewMenuItems();
        break;
      case 'Templates':
        this.actionContextMenuItems = this.cardActionsService.getCollectionMenuItems(this.collectionContextCardId, this.cardEditorFacadeService.getCurrentCardId());
        break;
    }
  }

  private setAction(item: ActionContextMenuItem, menu: 'Preview' | 'Templates'): () => void {
    switch (menu) {
      case 'Preview':
        return () => this.performPreviewAction(item);
      case 'Templates':
        return () => this.performTemplateAction(item);
    }
  }

  protected setCollectionContextCardId(cardId: string): void {
    this.collectionContextCardId = cardId;
  }

  private resetCollectionContextCardId(): void {
    this.collectionContextCardId = '';
  }

  protected toggleContextMenu(info: { event: MouseEvent, menu: 'Preview' | 'Templates' }): void {
    let { event, menu } = info;

    event.preventDefault();

    this.setActionContextMenuItems(menu);

    this.actionContextMenuService.removeActionContextMenu(this.actionContextMenuId);
    this.resetActionContextMenuId();

    this.actionContextMenuId = this.actionContextMenuService.open
      (
        this.actionContextMenuItems,
        (item: ActionContextMenuItem) => this.setAction(item, menu)(),
        this.actionContextMenuService.getStyle
          (
            {
              x: event.clientX,
              y: event.clientY
            }
          ),
        () => this.closedActionContextMenu(),
      );
  }

  protected performPreviewAction(item: ActionContextMenuItem): void {
    switch (item.id) {
      case 0:
        this.importedCardFileInput.nativeElement.value = '';
        this.importedCardFileInput.nativeElement.click();
        break;
      default:
        item.action(this.cardEditorFacadeService.getCurrentCardEditorCardDto());
        break;
    }
  }

  protected performTemplateAction(item: ActionContextMenuItem): void {
    let card: Card | undefined = this.cardTemplates.find((c: Card) => c.cardId === this.collectionContextCardId);

    if (!card) return;

    // CHECKME: Can we refactor this and make it something other than a switch statement? A dictionary if we really wanted to?
    switch (item.id) {
      case 0:
        item.action({ card: card, cards: this.cardTemplates });
        break;
      case 1:
        this.selectCard(card.cardId);
        break;
      case 2:
        this.deleteCard(card.cardId);
        break;
      default:
        throw new Error("No default implementation for item");
    }
  }

  private closedActionContextMenu(): void {
    this.resetActionContextMenuId();
    this.resetCollectionContextCardId();
  }

  private resetActionContextMenuId(): void {
    this.actionContextMenuId = '';
  }

  protected importCard(event: Event): void {
    let input: HTMLInputElement = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let selectedFile: File = input.files[0];
      let fileReader: FileReader = new FileReader();

      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          let json: Object = JSON.parse(event.target?.result as string); // Parse file content as JSON

          if (!isCardEditorCardDto(json)) throw new Error(`${logInfo(this.constructor.name, this.importCard.name)} - Didn't upload a card editor card dto`);

          let cardEditorCardDto: CardEditorCardDto = json;

          this.actionContextMenuItems[0].action({
            cardEditorCardDto,
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

  protected isCardFaceElementsLibraryDisabled(): boolean {
    return this.cardEditorFacadeService.isCardFaceElementsLibraryDisabled();
  }

  protected createdCardFaceElementPerCardFace(info: { type: string, dndPosition: DndPosition }): void {
    this.setElementAttributes(this.cardEditorFacadeService.createdCardFaceElementPerCardFace(info, this.getCardFaceClientRect()));
  }

  protected deletedCardFaceElementPerCardFace(id: string): void {
    this.cardEditorFacadeService.deletedCardFaceElementPerCardFace(id);

    this.cardEditorFacadeService.resetElementAttributes(
      this.$cardFaceElementWidth,
      this.$cardFaceElementHeight,
      this.$cardFaceElementX,
      this.$cardFaceElementY
    );

    this.cardEditorFacadeService.setElementsAttributes(this.destroyRef);

    // TODO: Grab the element with the biggest dimensions, pass it in to then reset the min card face dimensions possible?
  }

  protected getCardFaceElementIdentifiers(): {
    cardFaceElementId: string;
    cardFaceElementType: "Rt" | "Image";
    cardFaceElementZIndex: string;
    cardFaceElementPerCardFaceId: string;
  }[] {
    return this.cardEditorFacadeService.$currentCardFaceElementIdentifiers();
  }

  protected getCardFaceElementPositions(): Map<string, Coordinates> {
    return this.cardEditorFacadeService.$currentCardFaceElementPositions();
  }

  protected getCardFaceElementDimensions(): Map<string, Dimensions> {
    return this.cardEditorFacadeService.$currentCardFaceElementDimensions();
  }

  protected getCardFaceElementRts(): Map<string, string> {
    return this.cardEditorFacadeService.$currentCardFaceElementRts();
  }

  protected getCardFaceElementImages(): Map<string, string> {
    return this.cardEditorFacadeService.$currentCardFaceElementImages();
  }

  protected getCardFaceId(): string {
    return this.cardEditorFacadeService.getCurrentCardFaceId();
  }

  private cardFaceHexcode(destroyRef: DestroyRef): Subscription {
    return this.cardFaceHexcode$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((backgroundColor: string) => {
        this.cardEditorFacadeService.setCardFaceColor(backgroundColor, 'face');
      });
  }

  private borderHexcode(destroyRef: DestroyRef): Subscription {
    return this.borderHexcode$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((borderColor: string) => {
        this.cardEditorFacadeService.setCardFaceColor(borderColor, 'edge');
      });
  }

  private borderRadius(destroyRef: DestroyRef): Subscription {
    return this.borderRadius$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((borderRadius: number) => {
        this.cardEditorFacadeService.setCardFaceBorderRadius(borderRadius);
      });
  }

  private borderDimensions(destroyRef: DestroyRef): Subscription {
    return this.borderDimensions$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((bd: BorderDimensions) => {
        this.cardEditorFacadeService.setCardFaceBorderDimensions(bd);

        this.areBorderDimensionsEqual = this.cardEditorFacadeService.areBorderDimensionsEqual(this.$borderDimensions());
      });
  }

  private cardFaceDimensions(destroyRef: DestroyRef): Subscription {
    return combineLatest({
      height: this.cardFaceHeight$,
      width: this.cardFaceWidth$
    })
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((dimensions: {
        height: number;
        width: number;
      }) => {
        this.cardEditorFacadeService.setCardFaceDimensions(dimensions);
      });
  }

  private setCardFaceAttributes(): void {
    let {
      borderRadius,
      borderWidth,
      borderTopWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
      borderColor,
      backgroundColor,
      height,
      width
    } = this.cardEditorFacadeService.getCurrentCardFaceStyle();

    if (borderColor) this.$borderHexcode.set(borderColor);
    if (backgroundColor) this.$cardFaceHexcode.set(backgroundColor);
    if (borderRadius) this.$borderRadius.set(parseNumeric(borderRadius));
    if (width) this.$cardFaceWidth.set(parseNumeric(width));
    if (height) this.$cardFaceHeight.set(parseNumeric(height));

    if (!borderWidth) return;

    this.$borderDimensions.set({
      borderWidth: parseNumeric(borderWidth),
      borderRect: {
        top: (borderTopWidth) ? parseNumeric(borderTopWidth) : parseNumeric(borderWidth),
        left: (borderLeftWidth) ? parseNumeric(borderLeftWidth) : parseNumeric(borderWidth),
        bottom: (borderBottomWidth) ? parseNumeric(borderBottomWidth) : parseNumeric(borderWidth),
        right: (borderRightWidth) ? parseNumeric(borderRightWidth) : parseNumeric(borderWidth)
      }
    });

    this.areBorderDimensionsEqual = this.cardEditorFacadeService.areBorderDimensionsEqual(this.$borderDimensions());

    console.log(`%c${logInfo(this.constructor.name, this.setCardFaceAttributes.name)} - current card face style:\n${stringify(this.cardEditorFacadeService.getCurrentCardFaceStyle())}`, `color: #353535; background: #D2D7DF; padding: 5px; border-radius: 5px;`);
  }

  // TODO: Maybe use a linked signal or deep signal and combine cardFaceElementWidth and cardFaceElementHeight instead?
  private cardFaceElementDimensions(destroyRef: DestroyRef): Subscription {
    return combineLatest({
      width: this.cardFaceElementWidth$,
      height: this.cardFaceElementHeight$
    })
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((dimensions: {
        width: number;
        height: number;
      }) => {
        this.cardEditorFacadeService.setElementDimensions(
          dimensions,
          this.cardEditorFacadeService.$currentCardFaceElementId()
        );

        this.constrainCardFace(dimensions);

        // this.constrainCardFaceElement(dimensions);
      });
  }

  private cardFaceElementPosition(destroyRef: DestroyRef): Subscription {
    return combineLatest({
      x: this.cardFaceElementX$,
      y: this.cardFaceElementY$
    })
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((coordinates: {
        x: number;
        y: number;
      }) => {
        this.cardEditorFacadeService.setElementPosition(
          coordinates,
          this.cardEditorFacadeService.$currentCardFaceElementId()
        );
      });
  }

  protected setLayeringOperation(operation: 'front' | 'back' | 'forward' | 'backward'): void {
    this.cardEditorFacadeService.setLayer(this.cardEditorFacadeService.$currentCardFaceElementId(), operation);
  }
}
