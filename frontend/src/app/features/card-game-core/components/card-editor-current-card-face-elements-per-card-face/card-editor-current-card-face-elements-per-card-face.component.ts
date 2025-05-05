import { AfterViewInit, Component, ElementRef, HostListener, inject, input, InputSignal, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragHandle, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CardFaceElementPerCardFace } from '../../models/card-face-element';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { isCardFaceElementPerCardFace } from '../../utils/card-game-core.utils';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { Style } from '../../../style/models/style';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { CardEditorControlsDesignRteService } from '../../services/card-editor-controls-design-rte.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardFaceRtComponent } from '../card-face-rt/card-face-rt.component';
import { blobToDataURL } from '../../../../utils/utils';
import { CardEditorControlsDesignImageService } from '../../services/card-editor-controls-design-image.service';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { distinctUntilChanged } from 'rxjs';
import { ResizableWrapperComponent } from '../../../resizable/components/resizable-wrapper/resizable-wrapper.component';

@Component({
  selector: 'app-card-editor-current-card-face-elements-per-card-face',
  imports: [CdkDrag, CdkDragHandle, DragDropModule, CardFaceImageComponent, 
    CommonModule, CardFaceRtComponent, ResizableWrapperComponent],
  templateUrl: './card-editor-current-card-face-elements-per-card-face.component.html',
  styleUrl: './card-editor-current-card-face-elements-per-card-face.component.css'
})
export class CardEditorCurrentCardFaceElementsPerCardFaceComponent implements AfterViewInit {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardEditorControlsDesignRteService: CardEditorControlsDesignRteService = inject(CardEditorControlsDesignRteService);
  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);
  
  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;
  @ViewChildren('cardFaceElement') cardFaceElements!: QueryList<ElementRef>;
  
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mousePosition = {x: event.clientX, y: event.clientY};
  }

  private dragOffset: { x: number; y: number; } = {x: 0, y: 0};
  private mousePosition: {x: number, y: number} = {x:0, y: 0};

  private currentEditedCardFaceElementId: number = -1;

  position: DndPosition = {
    dndPositionId: 0,
    x: 0,
    y: 0
  };

  currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = [

  ];

  getDropListStyle(): Omit<Style, 'styleId'> {
    return {
      width: `100%`,
      height:  `100%`
    }
  }

  getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return this.cardEditorPreviewService.getCurrentCardFace().style;
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
    this.getCurrentCardFaceElementsPerCardFace();
    this.onRteTextChange();
    this.onDisableImageEditor();

    this.onSetWidth();
    this.onSetHeight();

    this.onSetX();
    this.onSetY();
  }

  ngOnInit() {
    this.onCreateCard();
    this.onCreateCardFaceElementPerCardFace();
  }

  ngAfterViewInit() {
  }

  private onCreateCard() {
    this.cardEditorPreviewService.onCreateCard$.subscribe(() => {
      this.getCurrentCardFaceElementsPerCardFace();
    })
  }

  getCurrentCardFaceElementsPerCardFace(): void {
    this.currentCardFaceElementsPerCardFace = this.cardEditorPreviewService.getCurrentCardFaceElementsPerCardFace();
  }

  private onCreateCardFaceElementPerCardFace(): void {
    this.cardEditorPreviewService.onCreateCardFaceElementPerCardFace$.subscribe((result: { type: string, dndPosition: DndPosition }) => {
      console.log(`On create card face element per card face`);

      let dndPosition = this.getRelativeDropPosition({ x: result.dndPosition.x, y: result.dndPosition.y });

      let cardFaceElementPerCardFaceId = (this.cardEditorPreviewService.isNewCardEditorCardDto())
        ? this.currentCardFaceElementsPerCardFace.length
        : this.currentCardFaceElementsPerCardFace[this.currentCardFaceElementsPerCardFace.length - 1].cardFaceElement.cardFaceElementId + 1;

      this.createCardFaceElementPerCardFace(cardFaceElementPerCardFaceId, result.type, dndPosition);

      // ASSUMPTION: The latest card face element per card face will always be the last of the index
     // this.clampNewCardFaceElementPerCardFacePosition();
    });
  }

  clampNewCardFaceElementPerCardFacePosition() {
    let idx = this.currentCardFaceElementsPerCardFace.length - 1;
    let latestDndPosition = this.currentCardFaceElementsPerCardFace[idx].dndPosition;
    this.currentCardFaceElementsPerCardFace[idx].dndPosition = this.clampDndPosition(idx, latestDndPosition);
  }
  
  createCardFaceElementPerCardFace(cardFaceElementPerCardFaceId: number, type: string, dndPosition: DndPosition) {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = {
      cardFaceElement: {
        cardFaceElementId: cardFaceElementPerCardFaceId,
        cardFaceElementContent: '',
        style: {
          styleId: 0
        }
      },
      dndItem: {
        dndItemId: 0,
        isDraggable: false,
        isDroppable: false,
      },
      dndPosition: dndPosition
    }

    switch (type) {
      case 'rte':
        cardFaceElementPerCardFace = {
          cardFaceElement: {
            cardFaceElementId:  cardFaceElementPerCardFaceId, // TODO: Replace with this.currentCardEditorCardFaceDto.cardFaceElementPerCardFaces.length + 1
            cardFaceElementContent: '',
            cardFaceElementType: 'rte',
            style: {
              styleId: 0,
              width: '100', // TODO: Set this for Angular Editor
              height: '100', // TODO: Set this for Angular Editor
              zIndex: 'inherit'
            }
          },
          dndItem: {
            dndItemId: 0,
            isDraggable: false,
            isDroppable: false,
          },
          dndPosition: dndPosition
        }
        break;
      case 'image':
        cardFaceElementPerCardFace = {
          cardFaceElement: {
            cardFaceElementId:  cardFaceElementPerCardFaceId,
            cardFaceElementContent: 'https://www.charitycomms.org.uk/wp-content/uploads/2019/02/placeholder-image-square.jpg',
            cardFaceElementType: 'image',
            style: {
              styleId: 0,
              width: '100', // Modify
              height: '100', //Modify
              zIndex: 'inherit'
            }
          },
          dndItem: {
            dndItemId: 0,
            isDraggable: false,
            isDroppable: false,
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

    changeZIndex() {

    }

    private getRelativeDropPosition(dropPoint: {x: number, y: number}): DndPosition {
      let containerRect = this.getCardFaceClientRect(); // Should return DOMRect
      return {
        dndPositionId: 0,
        x: dropPoint.x - containerRect.left,
        y: dropPoint.y - containerRect.top
      };
    }

    private getCardFaceElementSize(index: number): { width: number, height: number } | null {
      let elRef = this.cardFaceElements?.toArray()[index];

      if (elRef) {
        let rect = elRef.nativeElement.getBoundingClientRect();
        console.log(`Get card face element size:${JSON.stringify(index)}, ${JSON.stringify(rect)}`);
        return { width: rect.width, height: rect.height };
      }
      return null;
    }

    private clampDndPosition(cardFaceElementId: number, position: DndPosition): DndPosition {
      let container = this.getCardFaceClientRect();

      let { x, y } = position;
      let { left, top, width, height} = container;

      if (width < 0 || height < 0 || left < 0 || top < 0)
        return position;

      let scale: DndPosition = {
        x: x - left, y: y - top,
        dndPositionId: 0
      };
  
      // console.log(`Pointer position: ${pointerPosition.x}, ${pointerPosition.y}\nContainer width and height: ${container.width}, ${container.height}, Scale: ${scale.x}, ${scale.y}`);
  
      // CHECKME: Not sure if this is even necessary
      // containerWidth - elementWidth, containerHeight - elementHeight
      let elSize: {
        width: number;
        height: number;
      } | null = this.getCardFaceElementSize(cardFaceElementId);
      
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

    // this.position = this.clampDndPosition(parseInt(cardFaceElementId), { dndPositionId: 0, x: event.pointerPosition.x, y: event.pointerPosition.y });
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

    let localDropPosition = this.getRelativeDropPosition({x: event.dropPoint.x, y: event.dropPoint.y});

    this.position = {
      dndPositionId: this.position.dndPositionId,
      x: localDropPosition.x,
      y: localDropPosition.y,
    }

    if (this.isOutOfBounds(this.position)) {
      let draggedItem = event.item.data;
      let cardFaceElementId = draggedItem.cardFaceElement.cardFaceElementId;

      event.item.data.dndPosition = this.clampDndPosition(cardFaceElementId, this.position);
      return;
      // Only update position if within bounds
      /*event.item.data.dndPosition = {
        x: Math.max(0, Math.min(x, width)),
        y: Math.max(0, Math.min(y, height))
      };*/
    }

    event.item.data.dndPosition = this.position;
    this.updateCurrentCardEditorCardFaceDto();
    this.setElementAttributesPosition(this.position);
  }

  setElementAttributesPosition(position: DndPosition) {
    this.cardEditorControlsDesignElementAttributesService.x = position.x;
    this.cardEditorControlsDesignElementAttributesService.y = position.y;
  }

  updateCurrentCardEditorCardFaceDto() {
    this.setCurrentCardFaceElementsPerCardFace();
    this.cardEditorPreviewService.updateCardEditorCardFaceDto();
  }

  setCurrentCardFaceElementsPerCardFace() {
    this.cardEditorPreviewService.setCurrentCardFaceElementsPerCardFace(this.currentCardFaceElementsPerCardFace);
  }

  getCurrentCardFaceElementPerCardFaceByElementId(cardFaceElementId: number): CardFaceElementPerCardFace | undefined {
    return this.currentCardFaceElementsPerCardFace.find(cfe => cfe.cardFaceElement.cardFaceElementId === cardFaceElementId);
  }

  onEnableRte(event: Event, cardFaceElementId: number) {
    this.setElementAttributes(cardFaceElementId);

    let currentCardFaceElementPerCardFace = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
    
    if (currentCardFaceElementPerCardFace?.cardFaceElement && currentCardFaceElementPerCardFace?.cardFaceElement.cardFaceElementType === "rte") {
      {
        this.cardEditorControlsDesignRteService.setOnEnableRte(currentCardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent);
      }
    }
  }

  onRteTextChange() {
    // TODO: Subscribe to the service's on RTE editor change, then take the element ID that was passed in, then update here by setting the content from the element ID
    this.cardEditorControlsDesignRteService.onRteTextChange$.subscribe((text: string) => {
      let currentCardFaceElementPerCardFace = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
    
      if (currentCardFaceElementPerCardFace?.cardFaceElement && currentCardFaceElementPerCardFace?.cardFaceElement.cardFaceElementType === "rte") {
        currentCardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent = text;
      }
    })
  }

  onDisableRte() {
    // TODO: Unsubscribe from onRteTextChange here?
    this.cardEditorControlsDesignRteService.setOnDisableRte();
  }

  // TODO: Call the other two in there and replace individual instances with this
  setElementAttributes(cardFaceElementId: number) {
    this.setCurrentCardFaceElementId(cardFaceElementId);

    console.log(`Set element attributes - Card face element ID: ${cardFaceElementId}, Current edited card face element ID: ${this.currentEditedCardFaceElementId}`);

    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
    if (cardFaceElementPerCardFace && cardFaceElementPerCardFace.cardFaceElement.style) {
      this.setElementAttributesDndPosition(cardFaceElementPerCardFace.dndPosition);
      this.setElementAttributesDimensions(cardFaceElementPerCardFace.cardFaceElement.style);
    
      console.log(`After setting the other attributes - Card face element ID: ${cardFaceElementId}, Current edited card face element ID: ${this.currentEditedCardFaceElementId}`)
    }
  }

  setCurrentCardFaceElementId(cardFaceElementId: number) {
    this.currentEditedCardFaceElementId = cardFaceElementId;
    this.cardEditorControlsDesignElementAttributesService.setCurrentCardFaceElementId(this.currentEditedCardFaceElementId);
  }

  setElementAttributesDndPosition(dndPosition: DndPosition) {
    this.cardEditorControlsDesignElementAttributesService.x = dndPosition.x;
    this.cardEditorControlsDesignElementAttributesService.y = dndPosition.y;
  }

  setElementAttributesDimensions(style: Style) {
    let dimensions: {
      width: number,
      height: number
    } = { width: parseFloat(style.width as string), height: parseFloat(style.height as string) };

    this.cardEditorControlsDesignElementAttributesService.width = dimensions.width;
    this.cardEditorControlsDesignElementAttributesService.height = dimensions.height;
  }

  onFocusImage(cardFaceElementId: number) {
    this.setElementAttributes(cardFaceElementId);
    this.onDisableRte();
  }

  onEnableImageEditor(cardFaceElementId: number) {
    this.setElementAttributes(cardFaceElementId);
    this.onDisableRte();
    this.cardEditorControlsDesignImageService.setOnEnableImageEditor();
  }

  getCardFaceImageDimensions(id: number): {width: number, height: number} {
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
    this.cardEditorControlsDesignImageService.onDisableImageEditor$.subscribe((src: string) => {
      if (src === "")
        return;

      let currentCardFaceElementPerCardFace = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);

      if (currentCardFaceElementPerCardFace?.cardFaceElement && currentCardFaceElementPerCardFace?.cardFaceElement.cardFaceElementType !== "image")
        return;

      this.setCardFaceImageElementSrc(src);
    })
  }

  onResizableChange(dimensions: {
    width: number;
    height: number;
  }) {
    console.log(`On Dimensions change - Current edited card face element ID: ${this.currentEditedCardFaceElementId}, Image HTML Content Attributes: ${JSON.stringify(dimensions)}`);

    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
    if (cardFaceElementPerCardFace && cardFaceElementPerCardFace.cardFaceElement.style) {
      cardFaceElementPerCardFace.cardFaceElement.style.width = `${dimensions.width}`;
      cardFaceElementPerCardFace.cardFaceElement.style.height = `${dimensions.height}`;
    }

    // NOTE: Setting the label
    this.cardEditorControlsDesignElementAttributesService.width =dimensions.width;
    this.cardEditorControlsDesignElementAttributesService.height =dimensions.height;
  }

  onSetWidth() {
    this.cardEditorControlsDesignElementAttributesService.onSetWidth$
      .pipe(distinctUntilChanged())
      .subscribe((width: number) => {
      let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
      if (cardFaceElementPerCardFace && cardFaceElementPerCardFace.cardFaceElement.style) {
        cardFaceElementPerCardFace.cardFaceElement.style.width = `${width}`;

        console.log(`On set width - Card face element width: ${cardFaceElementPerCardFace.cardFaceElement.style.width}`);
      }
    })
  }

  onSetHeight() {
    this.cardEditorControlsDesignElementAttributesService.onSetHeight$
      .pipe(distinctUntilChanged())
      .subscribe((height: number) => {
        let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
        if (cardFaceElementPerCardFace && cardFaceElementPerCardFace.cardFaceElement.style) {
          cardFaceElementPerCardFace.cardFaceElement.style.height = `${height}`;

          console.log(`On set height - Card face element height: ${cardFaceElementPerCardFace.cardFaceElement.style.height}`);
        }
      })
  }

  onSetX() {
    this.cardEditorControlsDesignElementAttributesService.onSetX$
      .pipe(distinctUntilChanged())
      .subscribe((x: number) => {
        let cardFaceElementPerCardFace: CardFaceElementPerCardFace | undefined = this.getCurrentCardFaceElementPerCardFaceByElementId(this.currentEditedCardFaceElementId);
        if (cardFaceElementPerCardFace) {
          cardFaceElementPerCardFace.dndPosition.x = x;
        }
      })
  }

  onSetY() {
    this.cardEditorControlsDesignElementAttributesService.onSetY$
      .pipe(distinctUntilChanged())
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
  
      blobToDataURL(croppedImage).then((base64Image) => {
        cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent = base64Image;
  
        // console.log("croppedImage:", base64Image); // Check if it starts with "data:image/"
  
        // let updated = this.updateCardFaceElementPerCardFace(this.currentCardFaceElementsPerCardFace, cardFaceElementPerCardFace);
        // console.log("After set card face image element source: ", JSON.stringify(this.currentCardFaceElementsPerCardFace));
      });
    }
}
