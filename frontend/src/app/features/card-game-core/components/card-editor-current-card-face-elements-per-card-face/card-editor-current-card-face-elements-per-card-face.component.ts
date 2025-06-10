import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, ElementRef, inject, input, InputSignal, QueryList, Signal, ViewChild, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, from, switchMap } from 'rxjs';
import { FileMetadata } from '../../../../utils/models/file-metadata';
import { blobToDataURL, clamp, Coordinates, Dimensions, Threshold } from '../../../../utils/utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { ResizableWrapperComponent } from '../../../resizable/components/resizable-wrapper/resizable-wrapper.component';
import { Style } from '../../../style/models/style';
import { CardFaceElement, CardFaceElementImage, CardFaceElementPerCardFace, CardFaceElementRt } from '../../models/card-face-element';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { CardEditorControlsDesignImageService } from '../../services/card-editor-controls-design-image.service';
import { CardEditorControlsDesignRteService } from '../../services/card-editor-controls-design-rte.service';
import { CardEditorControlsElementLayeringAttributesService } from '../../services/card-editor-controls-element-layering-attributes.service';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID, MAX_CARD_FACE_HEIGHT, MAX_CURRENT_ELEMENTS_PER_CARD_FACE, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { getCardFaceElementImage, getCardFaceElementRt } from '../../utils/card-game-core.utils';
import { CardEditorElementDeleteButtonComponent } from '../card-editor-element-delete-button/card-editor-element-delete-button.component';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';
import { CardFaceRtComponent } from '../card-face-rt/card-face-rt.component';
import { CardEditorCardDto } from '../../models/card';

@Component({
  selector: 'app-card-editor-current-card-face-elements-per-card-face',
  imports: [CdkDrag, DragDropModule, CardFaceImageComponent, 
    CommonModule, CardFaceRtComponent, ResizableWrapperComponent, CardEditorElementDeleteButtonComponent],
  templateUrl: './card-editor-current-card-face-elements-per-card-face.component.html',
  styleUrl: './card-editor-current-card-face-elements-per-card-face.component.css'
})
export class CardEditorCurrentCardFaceElementsPerCardFaceComponent implements AfterViewInit {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
  private readonly cardEditorControlsDesignRteService: CardEditorControlsDesignRteService = inject(CardEditorControlsDesignRteService);
  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);
  
  private readonly cardEditorControlsElementLayeringAttributesService: CardEditorControlsElementLayeringAttributesService = inject(CardEditorControlsElementLayeringAttributesService);
  
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  placeholderImageSrc: string = 'https://www.charitycomms.org.uk/wp-content/uploads/2019/02/placeholder-image-square.jpg';

  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;
  @ViewChildren('cardFaceElement') cardFaceElements!: QueryList<ElementRef>;

  cardFaceBorderRadius: InputSignal<number> = input<number>(DEFAULT_CARD_FACE_BORDER_RADIUS);
  cardFaceBorderRadiusComputed: Signal<number> = computed(() => this.cardFaceBorderRadius());

  private dragOffset: Coordinates = { x: 0, y: 0 };
  private mousePosition: Coordinates = { x: 0, y: 0 };

  currentEditedCardFaceElementId: string = DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID;

  currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = [];

  getCardFaceElementContainer(): Omit<Style, 'styleId'> {
    return {
      width: `100%`,
      height:  `100%`,
      borderRadius: `${this.cardFaceBorderRadiusComputed()}px`
    }
  }

  getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return this.cardEditorPreviewService.getCurrentCardFace().style;
  }

  onSetCardEditorCardDtoByCardId(): void {
    this.cardEditorPreviewService.onSetCardEditorCardDtoByCardId$
      .pipe(
        takeUntilDestroyed()
      )
        .subscribe(() => {
        this.getCurrentCardFaceElementsPerCardFace();
        this.resetCardFaceElementAttributes();
    })
  }

  getDragDroppedBounds(): {left: number, top: number, width: number, height: number} {
    let {left, top, width, height} = this.getCardFaceClientRect();
    return {
      left,
      top,
      width,
      height,
    }
  }
  
  getCardFaceClientRect() {
    if (!this.cardEditorFace) {
      throw new Error('cardEditorFace is not available!');
    }
    
    return this.cardEditorFace.nativeElement.getBoundingClientRect();
  }

  constructor() {
    // CHECKME: Make sure this doesn't break anything, we put it here to have injection for takeUntilDestroyed
    this.getCurrentCardFaceElementsPerCardFace();
    this.onSetCardEditorCardDtoByCardId();
    
    this.onRteTextChange();
    this.onDisableImageEditor();

    this.onSetWidth();
    this.onSetHeight();

    this.onSetX();
    this.onSetY();

    this.postFlip();

    this.onCreateCardEditorCardDto();
    this.onCreateCardFaceElementPerCardFace();
    this.onDeleteCardFaceElementPerCardFace();
    this.onUpdateCardEditorCardDto();

    this.onBringToFront();
    this.onSendToBack();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  private onCreateCardEditorCardDto() {
    this.cardEditorPreviewService.onCreateCardEditorCardDto$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.getCurrentCardFaceElementsPerCardFace();
        this.resetCardFaceElementAttributes();
      })
  }

  private onUpdateCardEditorCardDto() {
    this.cardEditorPreviewService.onUpdateCardEditorCardDto$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.getCurrentCardFaceElementsPerCardFace();
        this.resetCardFaceElementAttributes();
      })
  }

  private postFlip() {
    this.cardEditorPreviewService.postFlip$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.resetCardFaceElementAttributes();
      });
  }

  resetCardFaceElementAttributes() {
    this.onDisableRte();
    this.currentEditedCardFaceElementId = DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID; // Resets what's being selected

    this.cardEditorControlsDesignElementAttributesService.resetCardFaceElementAttributes();
  }

  private onDeleteCardFaceElementPerCardFace() {
    this.cardEditorPreviewService.onDeleteCardFaceElementPerCardFace$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.getCurrentCardFaceElementsPerCardFace();
        this.resetCardFaceElementAttributes();
      })
  }

  getCardFaceElementRtContentByCardFaceElementId(cardFaceElementId: string): string {
    let cardFaceElement: CardFaceElement | undefined = this.currentCardFaceElementsPerCardFace.find(c => c.cardFaceElement.cardFaceElementId === cardFaceElementId &&  c.cardFaceElement.cardFaceElementType === "Rte")?.cardFaceElement;
    
    if (!cardFaceElement)
      throw new Error("Card face element not found");

    let cardFaceElementRt: CardFaceElementRt | undefined = getCardFaceElementRt(cardFaceElement);

    if (!cardFaceElementRt)
      throw new Error("Card face element RT is undefined");

    // FIXME: Why is this undefined
    /*if (cardFaceElementRt.cardFaceElementContent === undefined)
      throw new Error("Card face element content is undefined");*/

    return cardFaceElementRt.cardFaceElementContent ?? '';
  }

  getCardFaceElementImageSrcByCardFaceElementId(cardFaceElementId: string): string | undefined {
     let cardFaceElement: CardFaceElement | undefined = this.currentCardFaceElementsPerCardFace.find(c => c.cardFaceElement.cardFaceElementId === cardFaceElementId && c.cardFaceElement.cardFaceElementType === "Image")?.cardFaceElement;
    
    if (!cardFaceElement)
      return;

    let cardFaceElementImage: CardFaceElementImage | undefined = getCardFaceElementImage(cardFaceElement);

    if (!cardFaceElementImage || !cardFaceElementImage.imageFileMetadata || !cardFaceElementImage.imageFileMetadata.fileName)
      return this.placeholderImageSrc;

    return cardFaceElementImage?.imageFileMetadata?.fileName ?? this.placeholderImageSrc;
  }

  getCurrentCardFaceElementsPerCardFace(): void {
    this.currentCardFaceElementsPerCardFace = this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace();
  }

  private onCreateCardFaceElementPerCardFace(): void {
    this.cardEditorPreviewService.onCreateCardFaceElementPerCardFace$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((result: { type: string, dndPosition: DndPosition }) => {
      if (this.currentCardFaceElementsPerCardFace.length >= MAX_CURRENT_ELEMENTS_PER_CARD_FACE) {
        console.error(`On create card face element per card face - Too many card face element per card face`);
        return;
      }

      let dndPosition: Coordinates = this.getRelativeCoordinates({ x: result.dndPosition.x, y: result.dndPosition.y });

      // FIXED: Elements can share the same ID, so you can accidentally select double
      // So we'll just do Date.now which should return a large number and it should still be fine because it is parseable in the backend
      let cardFaceElementPerCardFaceId: string = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

      this.createCardFaceElementPerCardFace(cardFaceElementPerCardFaceId, result.type, dndPosition);

      // ASSUMPTION: The latest card face element per card face will always be the last of the index
     // this.clampNewCardFaceElementPerCardFacePosition();
    });
  }
  
  // FXME: Card face element per card face and card face element should not share the same ID
  createCardFaceElementPerCardFace(cardFaceElementPerCardFaceId: string, type: string, dndPosition: Coordinates) {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = {
      cardFaceElementPerCardFaceId: cardFaceElementPerCardFaceId,
      cardFaceElement: {
        cardFaceElementType: 'Rte',
        cardFaceElementId: cardFaceElementPerCardFaceId,
        style: {
          styleId: "0",
          zIndex: '1'
        },
      },
      dndItem: {
        dndItemId: "0",
        isDraggable: false,
        isDroppable: false,
        isRotatable: false
      },
      dndPosition: 
      {
        dndPositionId: "0",
        ...dndPosition
      }
    }

    switch (type) {
      case 'Rte':
        cardFaceElementPerCardFace = {
          cardFaceElementPerCardFaceId: cardFaceElementPerCardFaceId,
          cardFaceElement: {
            cardFaceElementType: 'Rte',
            cardFaceElementId:  cardFaceElementPerCardFaceId,
            style: {
              styleId: "0",
              width: '100', // TODO: Set this for Angular Editor
              height: '100', // TODO: Set this for Angular Editor
              zIndex: '1'
            }
          },
          dndItem: {
            dndItemId: "0",
            isDraggable: false,
            isDroppable: false,
            isRotatable: false
          },
          dndPosition:
          {
            dndPositionId: "0",
            ...dndPosition
          }
        }
        break;
      case 'Image':
        cardFaceElementPerCardFace = {
          cardFaceElementPerCardFaceId: cardFaceElementPerCardFaceId,
          cardFaceElement: {
            cardFaceElementType: 'Image',
            cardFaceElementId:  cardFaceElementPerCardFaceId,
            style: {
              styleId: "0",
              width: '100', // Modify
              height: '100', //Modify
              zIndex: '1'
            }
          },
          dndItem: {
            dndItemId: "0",
            isDraggable: false,
            isDroppable: false,
            isRotatable: false
          },
         dndPosition:
          {
            dndPositionId: "0",
            ...dndPosition
          }
        }
        break;
      default:
        // console.log("Default");
        break;
    }

    this.currentCardFaceElementsPerCardFace.push(cardFaceElementPerCardFace);
    this.updateCurrentCardEditorCardFaceDto();
    this.setElementAttributes(cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId);
  }

  onDragStartMouseDown(event: MouseEvent) {
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }

  onDragStarted(event: CdkDragStart<any>) {
    // NOTE: We grab the data directly because what was passed in could be stale
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

    if (!cardFaceElementPerCardFace)
      throw new Error("No currently edited card face element");

    let {x, y} = cardFaceElementPerCardFace.dndPosition;

    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.setDragOffset({x, y});
  }

  // FIXED: The issue was that the mouse position wasin in viewport coordinates
  // But the posiiton is relative to the container
  // NOTE: It's possible to get a negative number
  setDragOffset(position: Coordinates) {
    let mouseRelativeToContainer: Coordinates = this.getRelativeCoordinates(this.mousePosition);

    this.dragOffset = {
      x: mouseRelativeToContainer.x - position.x,
      y: mouseRelativeToContainer.y - position.y
    };
  }

  private getRelativeCoordinates(absolute: Coordinates): Coordinates {
    let containerRect = this.getCardFaceClientRect(); // Should return DOMRect
    let {left, top, width, height} = containerRect;
    return {
      x: clamp(absolute.x - left, 0, width),
      y: clamp(absolute.y - top, 0, height)
    };
  }

   private isOutOfBounds(cardFaceElementId: string, position: Coordinates): boolean {
      let container = this.getCardFaceClientRect();

      let { x, y } = position;
      let { width, height} = container;

      console.log(`Is out of bounds: container - ${JSON.stringify(container)}, position - ${JSON.stringify(position)}`);
    
      let dimensions: Dimensions = this.getCardFaceElementDimensions(cardFaceElementId);

      if (width < 0 || height < 0)
        throw new Error("No container dimensions");
  
      let isOutOfBounds: boolean = (
        x < 0 ||
        y < 0 ||
        x + dimensions.width > width ||
        y + dimensions.height > height
      );

      return isOutOfBounds;
    }

  private clampDndPosition(cardFaceElementId: string, position: Coordinates): Coordinates {
   let dimensions: Dimensions = this.getCardFaceElementDimensions(cardFaceElementId);

    // TODO: Maybe should use data instead of grabbing from HTML
    let container = this.getCardFaceClientRect(); // Should return { left, top, width, height }
    
    let { width, height } = container;
    let { x, y } = position;

     console.log(`Container dimensions: ${width}, ${height}, element dimensions: ${JSON.stringify(dimensions)}\nPosition: ${JSON.stringify(position)}`);

    return {
      x: clamp(x, 0, width - dimensions.width),
      y: clamp(y, 0, height - dimensions.height)
    };
  }
  
  onDragMoved(event: CdkDragMove<any>): void {
    // Calculates relative position of pointer in container
    // FIXME: I think the fact that the pointer is at the cursor might be causing issues

    // TODO: We snap to grid here
    // Custom preview potentially?

    // console.log(`On drag moved: ${(JSON.stringify(event.pointerPosition))}`)
  }
  

  onDragDropped(event: CdkDragDrop<any>) {
    console.log(`Drop point: ${JSON.stringify(event.dropPoint)}`)
    
    // Convert dropPoint to container-relative coordinates
    let localDropPosition: Coordinates = this.getRelativeCoordinates(event.dropPoint);

    let localPosition: Coordinates = {
      x: localDropPosition.x - this.dragOffset.x,
      y: localDropPosition.y - this.dragOffset.y
    };

    let clamped: Coordinates = this.clampDndPosition(this.currentEditedCardFaceElementId, localPosition);

    console.log(`Local drop position: ${JSON.stringify(localDropPosition)}, Local drag offset: ${JSON.stringify(this.dragOffset)}, Drag with offset: ${JSON.stringify(localPosition)}, Clamped: ${JSON.stringify(clamped)}`);

    this.setElementAttributesPosition(clamped);

    // FIXED: Sometimes it just doesn't update and I have no clue why, so this is here to try to force the rerender
    // and clamp the native element, force it to absolutely have a style
    // because for some reason, the element just lacked left and right after dragging it out of bounds twice
    let element: HTMLElement = event.item.element.nativeElement;
    element.style.left = `${clamped.x}px`;
    element.style.top = `${clamped.y}px`;
  }

  setElementAttributesPosition(position: Coordinates) {
   this.cardEditorControlsDesignElementAttributesService.setX(position.x);
   this.cardEditorControlsDesignElementAttributesService.setY(position.y);
  }

  updateCurrentCardEditorCardFaceDto() {
    this.setCurrentCardFaceElementsPerCardFace();
    this.cardEditorPreviewService.updateCardEditorCardFaceDto();
  }

  setCurrentCardFaceElementsPerCardFace() {
    this.cardEditorPreviewService.setCurrentCardFaceElementsPerCardFace(this.currentCardFaceElementsPerCardFace);
  }

  getCurrentCardFaceElementPerCardFaceByElementId(cardFaceElementId: string): CardFaceElementPerCardFace | undefined {
    return this.currentCardFaceElementsPerCardFace.find(cfe => cfe.cardFaceElement.cardFaceElementId === cardFaceElementId);
  }

  // TODO: Move it into a utils

  onEnableRte(event: Event, cardFaceElementId: string) {
    this.setElementAttributes(cardFaceElementId);

    let currentCardFaceElementPerCardFace = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

    if (currentCardFaceElementPerCardFace?.cardFaceElement === undefined || currentCardFaceElementPerCardFace?.cardFaceElement.cardFaceElementType !== "Rte")
      return;

    let cardFaceElementRt: CardFaceElementRt | undefined =( getCardFaceElementRt(currentCardFaceElementPerCardFace.cardFaceElement));
    
    if (!cardFaceElementRt)
      throw new Error("On enable RTE: Card face element RT is undefined");

    this.cardEditorControlsDesignRteService.setOnEnableRte(cardFaceElementRt.cardFaceElementContent ?? "");
  }

  onRteTextChange() {
    this.cardEditorControlsDesignRteService.onRteTextChange$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((text: string) => {
        // CHECKME: It should be modifying the original reference, because objects are passed by reference in TS?
        let currentCardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

        if (currentCardFaceElementPerCardFace?.cardFaceElement === undefined || currentCardFaceElementPerCardFace?.cardFaceElement.cardFaceElementType !== "Rte")
          throw new Error("Card face element is undefined or not an RTE");

        let cardFaceElementRt: CardFaceElementRt | undefined = (getCardFaceElementRt(currentCardFaceElementPerCardFace.cardFaceElement));

        if (cardFaceElementRt === undefined)
          throw new Error("Card face element rich text is undefined");

        (cardFaceElementRt.cardFaceElementContent as string) = text;
    })
  }

  onDisableRte() {
    // CHECKME: Unsubscribe from onRteTextChange here?
    this.cardEditorControlsDesignRteService.setOnDisableRte();
  }

  setElementAttributes(cardFaceElementId: string) {
    this.setCurrentCardFaceElementId(cardFaceElementId);

    let position: Coordinates = this.getCardFaceElementPerFacePosition(cardFaceElementId);
    this.setElementAttributesPosition(position);

    let dimensions: Dimensions = this.getCardFaceElementDimensions(cardFaceElementId);
    this.setElementAttributesDimensions(dimensions);
  }

  parseNumeric(value: string | number): number {
    if (typeof value === 'number') return value;
    // Remove anything that's not a digit, decimal, or minus sign
    let numeric: RegExpMatchArray | null = value.match(/-?\d+(\.\d+)?/);
    return numeric ? parseFloat(numeric[0]) : 0;
  }

  setCurrentCardFaceElementId(cardFaceElementId: string) {
    this.currentEditedCardFaceElementId = cardFaceElementId;
    
    this.cardEditorControlsDesignElementAttributesService.currentCardFaceElementId.set(this.currentEditedCardFaceElementId);
  }

  setElementAttributesDimensions(dimensions: Dimensions) {
    this.cardEditorControlsDesignElementAttributesService.setWidth(dimensions.width);
    this.cardEditorControlsDesignElementAttributesService.setHeight(dimensions.height);
  }

  onFocusImage(cardFaceElementId: string) {
    this.setElementAttributes(cardFaceElementId);
    this.onDisableRte();
  }

  onEnableImageEditor(cardFaceElementId: string) {
    this.setElementAttributes(cardFaceElementId);
    this.onDisableRte();
    this.cardEditorControlsDesignImageService.setOnEnableImageEditor();
  }

  getCardFaceElementPerFacePosition(cardFaceElementId: string): Coordinates {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(cardFaceElementId);
    
     if (!cardFaceElementPerCardFace)
      throw new Error("No card face element per card face");

    let {dndPosition} = cardFaceElementPerCardFace;

    let position: Coordinates = {
      x: dndPosition.x,
      y: dndPosition.y
    }

    return position;
  }

  getCardFaceElementDimensions(cardFaceElementId: string): Dimensions {
    let cardFaceElementPerCardFace = this.getCurrentCardFaceElementPerCardFaceByElementId(cardFaceElementId);

  if (!cardFaceElementPerCardFace)
      throw new Error("No card face element per card face");

    let style: Style | undefined = cardFaceElementPerCardFace.cardFaceElement.style;

     if (!style)
      throw new Error("No card face element style");

    let {width, height} = style;

    if (!width || !height)
      throw new Error("No width or height associated with this style");

    let dimensions: Dimensions = {
      width: this.parseNumeric(width),
      height: this.parseNumeric(height)
    };

    return dimensions;
  }

  onDisableImageEditor() {
    this.cardEditorControlsDesignImageService.onDisableImageEditor$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((src: string) => {
      if (src === "")
        return;

      let currentCardFaceElementPerCardFace = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

      if (currentCardFaceElementPerCardFace?.cardFaceElement && currentCardFaceElementPerCardFace?.cardFaceElement.cardFaceElementType !== "Image")
        return;

      this.setCardFaceImageElementSrc(src);
    })
  }

  // TODO: Rework this, because cards have different max widths and heights
  getResizeThreshold(): Threshold {
    return {
      min: MIN_CARD_FACE_WIDTH,
      max: MAX_CARD_FACE_HEIGHT
    }
  }

  onResizableChange(dimensions: Dimensions) {
    console.log(`On Dimensions change - Current edited card face element ID: ${this.currentEditedCardFaceElementId}, Image HTML Content Attributes: ${JSON.stringify(dimensions)}`);

    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

    if (!cardFaceElementPerCardFace || !cardFaceElementPerCardFace.cardFaceElement.style)
      throw new Error("No card face element associated with resizable change?");

    this.setElementAttributesDimensions(dimensions);
  }

  onSetWidth() {
    this.cardEditorControlsDesignElementAttributesService.onSetWidth$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((width: number) => {
        let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

        if (!cardFaceElementPerCardFace)
          throw new Error("No card face element per card face to set width");

        if (!cardFaceElementPerCardFace.cardFaceElement.style)
          throw new Error("No card face element style to set width");

        cardFaceElementPerCardFace.cardFaceElement.style.width = `${width}px`;
    })
  }

  onSetHeight() {
    this.cardEditorControlsDesignElementAttributesService.onSetHeight$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((height: number) => {
        let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

        if (!cardFaceElementPerCardFace)
          throw new Error("No card face element per card face to set height");

        if (!cardFaceElementPerCardFace.cardFaceElement.style)
          throw new Error("No card face element style to set height");

        cardFaceElementPerCardFace.cardFaceElement.style.height = `${height}px`;
      })
  }

  onSetX() {
    this.cardEditorControlsDesignElementAttributesService.onSetX$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((x: number) => {
        let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
        
       if (!cardFaceElementPerCardFace)
          throw new Error("No card face element per card face to set X ");

        if (cardFaceElementPerCardFace.dndPosition.x === x)
          throw new Error("The new value is equal to the new value for X position");
        
          cardFaceElementPerCardFace.dndPosition.x = x;
      })
  }

  onSetY() {
    this.cardEditorControlsDesignElementAttributesService.onSetY$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((y: number) => {
        let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
        
        if (!cardFaceElementPerCardFace)
          throw new Error("No card face element per card face to set Y");

        if (cardFaceElementPerCardFace.dndPosition.y === y)
          throw new Error("The new value is equal to the new value for Y position");
        
          cardFaceElementPerCardFace.dndPosition.y = y;
      })
  }

  setCardFaceImageElementSrc(croppedImage: string): void {
    // https://stackoverflow.com/questions/51019467/convert-blob-to-image-url-and-use-in-image-src-to-display-image
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

    if (!cardFaceElementPerCardFace)
      return;

    from(blobToDataURL(croppedImage))
      .pipe(
        switchMap((base64Image) =>
          this.cardEditorPreviewService.getImageFormData$(base64Image)
        ),
        switchMap((formData: FormData | undefined) => {
          if (!formData)
            throw new Error("No card face element image file to upload");

          let cardFaceElementImage: CardFaceElementImage | undefined = getCardFaceElementImage(cardFaceElementPerCardFace.cardFaceElement);

          if (!cardFaceElementImage)
            throw new Error("Not a card face element image");

          return this.cardEditorPreviewService.createCardFaceElementImage$(
            cardFaceElementImage.cardFaceElementId,
            formData
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (cardFaceElementImageFileMetadata: FileMetadata | undefined) => {
          if (!cardFaceElementImageFileMetadata) {
            throw new Error("Set card face image element src: Card face element image file metadata is empty");
          }

          let cardFaceElementImage: CardFaceElementImage = (cardFaceElementPerCardFace.cardFaceElement as CardFaceElementImage);

          if (cardFaceElementImage.imageFileMetadata === undefined)
            throw new Error("Set card face image element src: Image file metadata is undefined");

          cardFaceElementImage.imageFileMetadata = cardFaceElementImageFileMetadata;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  // Is this even necessary? The CSS should be handling the stacking, but I guess the question is the drag and drop functionality?
  sortOrder() {
    this.currentCardFaceElementsPerCardFace = this.currentCardFaceElementsPerCardFace.sort((a, b) => {
      if (
        a.cardFaceElement.style === undefined ||
        b.cardFaceElement.style === undefined ||
        a.cardFaceElement.style['zIndex'] === undefined ||
        b.cardFaceElement.style['zIndex'] === undefined
      ) return 1;

      // 1 - A comes after B
      // -1 - A comes before B
      // 0 - No change in order
      return parseInt(a.cardFaceElement.style['zIndex']) > parseInt(b.cardFaceElement.style['zIndex'])
        ? 1 : parseInt(a.cardFaceElement.style['zIndex']) < parseInt(b.cardFaceElement.style['zIndex'])
          ? -1 : 0;
    });
  }

  onBringToFront() {
    this.cardEditorControlsElementLayeringAttributesService.onBringToFront$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        let maxZIndex: number = Math.max(
          ...this.currentCardFaceElementsPerCardFace.map(
            e => parseInt(e.cardFaceElement.style?.zIndex ?? "1") || 0
          )
        );

        let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.currentCardFaceElementsPerCardFace.find(c => c.cardFaceElement.cardFaceElementId === this.currentEditedCardFaceElementId);

        if (!cardFaceElementPerCardFace) return;

        if (!cardFaceElementPerCardFace.cardFaceElement.style)
          throw new Error("Card face element has no style to add Z index to");

        cardFaceElementPerCardFace.cardFaceElement.style.zIndex = `${clamp(maxZIndex + 1, 0, this.currentCardFaceElementsPerCardFace.length)}`;
      })
  }

  onSendToBack() {
    this.cardEditorControlsElementLayeringAttributesService.onSendToBack$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        let minZIndex: number = Math.min(
          ...this.currentCardFaceElementsPerCardFace.map(
            e => parseInt(e.cardFaceElement.style?.zIndex ?? "1") || 0
          )
        );

        let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.currentCardFaceElementsPerCardFace.find(c => c.cardFaceElement.cardFaceElementId === this.currentEditedCardFaceElementId);

        if (!cardFaceElementPerCardFace) return;

        if (!cardFaceElementPerCardFace.cardFaceElement.style)
          throw new Error("Card face element has no style to add Z index to");

        // minZIndex - 1 makes it invisible, for some reason -1 makes it invisible?
        cardFaceElementPerCardFace.cardFaceElement.style.zIndex = `${clamp(minZIndex -1, 0, this.currentCardFaceElementsPerCardFace.length)}`;
      })
  }
}
