import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, ElementRef, HostListener, inject, input, InputSignal, QueryList, Signal, ViewChild, ViewChildren } from '@angular/core';
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
import { DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID, MAX_CARD_FACE_HEIGHT, MAX_CURRENT_ELEMENTS_PER_CARD_FACE, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { getCardFaceElementImage, getCardFaceElementRt, isCardFaceElementPerCardFace } from '../../utils/card-game-core.utils';
import { CardEditorElementDeleteButtonComponent } from '../card-editor-element-delete-button/card-editor-element-delete-button.component';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';
import { CardFaceRtComponent } from '../card-face-rt/card-face-rt.component';

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

  borderRadius: InputSignal<number> = input<number>(2);
  borderRadiusComputed: Signal<number> = computed(() => this.borderRadius());
  
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mousePosition = {x: event.clientX, y: event.clientY};
  }

  private dragOffset: Coordinates = { x: 0, y: 0 };
  private mousePosition: Coordinates = { x: 0, y: 0 };

  currentEditedCardFaceElementId: string = DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID;

  position: DndPosition = {
    dndPositionId: "0",
    x: 0,
    y: 0
  };

  currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = [

  ];

  getDropListStyle(): Omit<Style, 'styleId'> {
    return {
      width: `100%`,
      height:  `100%`,
      borderRadius: `${this.borderRadiusComputed()}px`
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

    this.onCreateCard();
    this.onCreateCardFaceElementPerCardFace();
    this.onDeleteCardFaceElementPerCardFace();
    this.onUpdateCard();

    this.onBringToFront();
    this.onSendToBack();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  private onCreateCard() {
    this.cardEditorPreviewService.onCreateCard$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.getCurrentCardFaceElementsPerCardFace();
        this.resetCardFaceElementAttributes();
      })
  }

  private onUpdateCard() {
    this.cardEditorPreviewService.onUpdateCard$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.getCurrentCardFaceElementsPerCardFace();
        this.resetCardFaceElementAttributes();
      })
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

      let dndPosition = this.getRelativeDropPosition({ x: result.dndPosition.x, y: result.dndPosition.y });

      // FIXED: Elements can share the same ID, so you can accidentally select double
      // So we'll just do Date.now which should return a large number and it should still be fine because it is parseable in the backend
      let cardFaceElementPerCardFaceId: string = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

      this.createCardFaceElementPerCardFace(cardFaceElementPerCardFaceId, result.type, dndPosition);

      // ASSUMPTION: The latest card face element per card face will always be the last of the index
     // this.clampNewCardFaceElementPerCardFacePosition();
    });
  }
  
  // FXME: Card face element per card face and card face element should not share the same ID
  createCardFaceElementPerCardFace(cardFaceElementPerCardFaceId: string, type: string, dndPosition: DndPosition) {
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
      dndPosition: dndPosition,
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
          dndPosition: dndPosition
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
          dndPosition: dndPosition
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

  // TODO: Change z-index of the elements
  onDragStarted(event: CdkDragStart<any>, item: CardFaceElementPerCardFace) {
    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.setDragOffset(item);
  }

  setDragOffset(item: CardFaceElementPerCardFace) {
    this.dragOffset = {
      x: item.dndPosition.x - this.mousePosition.x,
      y: item.dndPosition.y - this.mousePosition.y
    };
  }

    private getRelativeDropPosition(dropPoint: {x: number, y: number}): DndPosition {
      let containerRect = this.getCardFaceClientRect(); // Should return DOMRect
      return {
        dndPositionId: "0",
        x: dropPoint.x - containerRect.left,
        y: dropPoint.y - containerRect.top
      };
    }

    private clampDndPosition(cardFaceElementId: string, position: DndPosition): DndPosition {
      let container = this.getCardFaceClientRect();

      let { x, y } = position;
      let { left, top, width, height} = container;

      if (width < 0 || height < 0 || left < 0 || top < 0)
        return position;

      let scale: DndPosition = {
        x: x - left, y: y - top,
        dndPositionId: "0"
      };
  
      // console.log(`Pointer position: ${pointerPosition.x}, ${pointerPosition.y}\nContainer width and height: ${container.width}, ${container.height}, Scale: ${scale.x}, ${scale.y}`);
  
      // CHECKME: Not sure if this is even necessary
      // containerWidth - elementWidth, containerHeight - elementHeight
  
      /*if (elSize !== null) {
        scale.x = Math.max(0, Math.min(scale.x, width - elSize.width));
        scale.y = Math.max(0, Math.min(scale.y, height - elSize.height));

      }*/
      
      scale.x = Math.max(0, Math.min(scale.x, width));
      scale.y = Math.max(0, Math.min(scale.y, height));

      return scale;
    }

    private isOutOfBounds(position: DndPosition): boolean {
      let container = this.getCardFaceClientRect();

      let { x, y } = position;
      let { left, top, width, height} = container;

      console.log(`Is out of bounds: container - ${JSON.stringify(container)}, position - ${JSON.stringify(position)}`);

      if (width < 0 || height < 0 || left < 0 || top < 0)
        return false;
  
      // Define boundary thresholds (adjust as needed)
      let isOutOfBounds: boolean = (
        x < 0 ||
        y < 0 ||
        x > width ||
        y > height
      );

      return isOutOfBounds;
    }
  
  onDragMoved(event: CdkDragMove<any>): void {
    // Calculates relative position of pointer in container
    // FIXME: I think the fact that the pointer is at the cursor might be causing issues
    /*let element = event.source.element.nativeElement;
    let cardFaceElementId = element.getAttribute('card-face-element-id');

    if (cardFaceElementId === null)
      return;

    this.position = this.getRelativeDropPosition({x: event.pointerPosition.x, y: event.pointerPosition.y});

    // this.position = this.clampDndPosition(parseInt(cardFaceElementId), { dndPositionId: "0", x: event.pointerPosition.x, y: event.pointerPosition.y });
    console.log(`On drag moved: ${JSON.stringify(this.position)}`);*/

    this.position = {
      dndPositionId: this.position.dndPositionId,
      x: event.pointerPosition.x,
      y: event.pointerPosition.y
    }

    // console.log(`On drag moved: ${(JSON.stringify(event.pointerPosition))}`)
  }

  onDragEnded(event: CdkDragEnd, item: CardFaceElementPerCardFace) {
    /*if (!isCardFaceElementPerCardFace(item))
      return;
   
    // Offset from the element's original position
   let relativePosition = event.source.getFreeDragPosition();
    console.log('Relative position:', relativePosition);
  
    // Absolute position in the viewport
    let rect = event.source.element.nativeElement.getBoundingClientRect();
    console.log('Absolute position:', { left: rect.left, top: rect.top });
  
    item.dndPosition = this.position;
    this. updateCurrentCardEditorCardFaceDto();*/
  }
  

  onDragDropped(event: CdkDragDrop<any>) {
    if (!isCardFaceElementPerCardFace(event.item.data) && this.position === undefined)
      return;

    let localDropPosition = this.getRelativeDropPosition({
      x: event.dropPoint.x, 
      y: event.dropPoint.y});

    this.position = {
      dndPositionId: this.position.dndPositionId,
      x: localDropPosition.x,
      y: localDropPosition.y,
    }

    if (this.isOutOfBounds(this.position)) {
      let draggedItem = event.item.data;
      let cardFaceElementId = draggedItem.cardFaceElement.cardFaceElementId;

      let clampedDndPosition = this.clampDndPosition(cardFaceElementId, this.position);

      event.item.data.dndPosition = 
      {
        dndPositionId: event.item.data.dndPosition.dndPosiitonId,
        x: clampedDndPosition.x,
        y: clampedDndPosition.y
      }
      return;
      // Only update position if within bounds
      /*event.item.data.dndPosition = {
        x: Math.max(0, Math.min(x, width)),
        y: Math.max(0, Math.min(y, height))
      };*/
    }

    event.item.data.dndPosition.x = this.position.x;
    event.item.data.dndPosition.y = this.position.y;

    this.updateCurrentCardEditorCardFaceDto();
    this.setElementAttributesPosition(this.position);
  }

  setElementAttributesPosition(position: DndPosition) {
    this.cardEditorControlsDesignElementAttributesService.coordinates = {
      x: position.x,
      y: position.y
    }
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

  // TODO: Call the other two in there and replace individual instances with this
  setElementAttributes(cardFaceElementId: string) {
    this.setCurrentCardFaceElementId(cardFaceElementId);

    console.log(`Set element attributes - Card face element ID: ${cardFaceElementId}, Current edited card face element ID: ${this.currentEditedCardFaceElementId}`);

    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
    if (cardFaceElementPerCardFace && cardFaceElementPerCardFace.cardFaceElement.style) {
      this.setElementAttributesPosition(cardFaceElementPerCardFace.dndPosition);
      this.setElementAttributesDimensions(cardFaceElementPerCardFace.cardFaceElement.style);
    
      console.log(`After setting the other attributes - Card face element ID: ${cardFaceElementId}, Current edited card face element ID: ${this.currentEditedCardFaceElementId}`)
    }
  }

  setCurrentCardFaceElementId(cardFaceElementId: string) {
    this.currentEditedCardFaceElementId = cardFaceElementId;
    
    this.cardEditorControlsDesignElementAttributesService.currentCardFaceElementId = this.currentEditedCardFaceElementId;
  }

  setElementAttributesDimensions(style: Style) {
    this.cardEditorControlsDesignElementAttributesService.dimensions =  { width: parseFloat(style.width as string), height: parseFloat(style.height as string) };
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

  getCardFaceElementDimensions(id: string): {width: number, height: number} {
    let cardFaceElementPerCardFace = this.getCurrentCardFaceElementPerCardFaceByElementId(id);

    if (cardFaceElementPerCardFace) {
      let style: Style | undefined =  cardFaceElementPerCardFace.cardFaceElement.style;
      
      if (style) {
        let dimensions: {
          width: number,
          height: number } = {width: parseFloat(style.width as string), height: parseFloat(style.height as string)};
      
        return dimensions;
      }
    }

    return {width: -1, height: -1};
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

    cardFaceElementPerCardFace.cardFaceElement.style.width = `${dimensions.width}`;
    cardFaceElementPerCardFace.cardFaceElement.style.height = `${dimensions.height}`;

    // NOTE: Setting the label
    this.cardEditorControlsDesignElementAttributesService.dimensions = dimensions;
  }

  onSetWidth() {
    this.cardEditorControlsDesignElementAttributesService.onSetWidth$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((width: number) => {
      let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
      if (cardFaceElementPerCardFace && cardFaceElementPerCardFace.cardFaceElement.style) {
        cardFaceElementPerCardFace.cardFaceElement.style.width = `${width}`;

        // console.log(`On set width - Card face element width: ${cardFaceElementPerCardFace.cardFaceElement.style.width}`);
      }
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
        if (cardFaceElementPerCardFace && cardFaceElementPerCardFace.cardFaceElement.style) {
          cardFaceElementPerCardFace.cardFaceElement.style.height = `${height}`;

          // console.log(`On set height - Card face element height: ${cardFaceElementPerCardFace.cardFaceElement.style.height}`);
        }
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
        if (cardFaceElementPerCardFace) {
          cardFaceElementPerCardFace.dndPosition.x = x;
        }
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
        if (cardFaceElementPerCardFace) {
          cardFaceElementPerCardFace.dndPosition.y = y;
        }
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
