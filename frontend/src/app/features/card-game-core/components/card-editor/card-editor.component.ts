import { AfterViewInit, Component, computed, ElementRef, inject, input, Type, ViewChild, WritableSignal, Injector, ChangeDetectorRef } from '@angular/core';
import { CardFace } from '../../models/card-face';
import { Card, CardDto } from '../../models/card';
import { CdkDrag, DragDropModule, CdkDragHandle, CdkDragMove, CdkDragEnd, Point, DragRef, CdkDragStart, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
/*import { CardFaceElementApiService } from '../../services/card-face-element-api.service';
import { CardApiService } from '../../services/card-api.service';
import { CardFaceApiService } from '../../services/card-face-api.service';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';
import { CardFaceImageEditorComponent } from '../card-face-image-editor/card-face-image-editor.component';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';
import { FileUploadComponent } from '../../../../utils/components/file-upload/file-upload.component';
import { DomSanitizer } from '@angular/platform-browser';*/
import { CardFaceElement, CardFaceElementDto, CardFaceRte } from '../../models/card-face-element';
import { convertToRelativeDimensions } from '../../../style/utils/convert-dimensions.utils';

import { Image } from '../../../style/models/image';
import { Style } from '../../../style/models/style';
import { convertToRelativeCoordinates, pageToLocalCoordinates } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { isDndItem } from '../../../drag-and-drop/utils/dnd-item.utils';
import { isCardDto, isCardFaceElement, isCardFaceElementDto } from '../../utils/card-game-core.utils';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { CROPPED_IMAGE_TOKEN, CLOSE_IMAGE_EDITOR_TOKEN, RTE_HTML_CONTENT } from '../../../../shared/tokens';
import { CardFaceImageEditorComponent } from '../card-face-image-editor/card-face-image-editor.component';
import { SafeUrl } from '@angular/platform-browser';
import { parseCssDimension } from '../../../style/utils/parse-css-dimensions.utils';
import { blobToDataURL } from '../../../../utils/utils';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { FormsModule } from '@angular/forms';
import { CardApiService } from '../../services/card-api.service';
import { CardFaceApiService } from '../../services/card-face-api.service';
import { CardFaceElementApiService } from '../../services/card-face-element-api.service';
import { DndItem } from '../../../drag-and-drop/models/dnd-item';

// TODO: Resizable card face, have arrows for dragging, make sure there's a max width/height for that card face
@Component({
  selector: 'app-card-editor',
  imports: [
    AngularEditorModule, FormsModule,
    CommonModule, NgComponentOutlet,
    CardFaceRteComponent, CardFaceImageComponent,
    CdkDrag, CdkDragHandle, DragDropModule], // TODO: Remove CdkDrag
  templateUrl: './card-editor.component.html',
  styleUrl: './card-editor.component.css'
})
export class CardEditorComponent implements AfterViewInit {
  // https://www.youtube.com/watch?v=5JcMras7aaA
  private cardApiService = inject(CardApiService);
  private cardFaceApiService = inject(CardFaceApiService);
  private cardFaceElementApiService = inject(CardFaceElementApiService);

  /*private fileUploadComponent = inject(FileUploadComponent);
  private domSanitizer = inject(DomSanitizer);*/

  @ViewChild('cardEditorFace') cardEditorFaceRef!: ElementRef;
  @ViewChild('cardFaceElement') cardFaceElementRef!: ElementRef;
  private _cardFaceElementId: number = -1;
  private _cdr = inject(ChangeDetectorRef);

  onCardFaceModifyBtnText: string = "Create";

  constructor() {
    this.currentCardFace = (this.isFlipped) ? this.cardDto.backCardFace : this.cardDto.frontCardFace;
    this.setCurrentCardFaceElementsDto();
  }

  ngAfterViewInit(): void {
    let rect = this.getCardFaceClientRect();
    console.log('Size after view init:', rect.width, rect.height);

    let width: string = `${rect.width}px`;
    let height: string = `${rect.height}px`;

    this.updateCardFaceDimensions(width, height);
  }

  private updateCardFaceDimensions(width: string, height: string) {
    if (this.cardDto.frontCardFace && this.cardDto.frontCardFace.style) {
      this.cardDto.frontCardFace.style.width = width;
      this.cardDto.frontCardFace.style.height = height;
    }

    // TODO: Modify these depending on what face you're passing in for
    if (this.cardDto.backCardFace && this.cardDto.backCardFace.style) {
      this.cardDto.backCardFace.style.width = width;
      this.cardDto.backCardFace.style.height = height;
    }
  }

  isCurrentPopupMenuOpen: boolean = false;
  // TODO: Fix this, this should be for the card face image editor? Why is popup menu opening card face image?
  popupMenuInputs = {
    // TODO: Pass in the potential card face elements as well as front card face and back card face
    cardFaceImageAttr: {
      cardFaceImage: {
        imageId: 0,
        src: '',
        alt: ''
      },
      cardFaceImageStyle: {
        styleId: 0,
        width: '100',
        height: '150',
      }
    } as {
      cardFaceImage: Image;
      cardFaceImageStyle: Style;
    },
    htmlContentInput: ''
  };

  // REFERENCE for ngComponentOutlet 'outputs': https://stackoverflow.com/a/79401383
  /*
  We have Angular 19 and still is not possible to subscribe to output events, but there are two strategies to handle output events when using ngComponentOutlet:

  1. Inject a function using ngComponentOutletInjector and handle the behavior outside the component:
  2) Get a reference to the component using ViewChild.
  */
  popupMenuInjector: Injector = Injector.create({
    providers: [
      {
        // TODO: Rewrite, no need for this boolean
        provide: CLOSE_IMAGE_EDITOR_TOKEN,
        useValue: (showImageEditor: boolean) => this.onCloseImageEditor(showImageEditor)
      },
      {
        provide: CROPPED_IMAGE_TOKEN,
        useValue: (croppedImage: string) => this.setCardFaceImageElementSrc(croppedImage)
      },
      {
        provide: RTE_HTML_CONTENT,
        useValue: (htmlContent: string) => this.setRteHtmlContent(htmlContent)
      }
    ]
  });

  // TODO: If there's a card ID, then load the card face
  cardEditor = input<{ card: Card, frontCardFace: CardFace, backCardFace: CardFace, frontCardFaceElements: CardFaceElement[], backCardFaceElements: CardFaceElement[] }>();
  cardEditorComputed = computed(() => {
    let card: Card | undefined = this.cardEditor()?.card;

    if (card === undefined || card.cardId <= 0)
      return;

    let frontCardFace: CardFace | undefined = this.cardEditor()?.frontCardFace;

    if (frontCardFace === undefined)
      return;

    this.cardDto.frontCardFace = frontCardFace;

    let backCardFace: CardFace | undefined = this.cardEditor()?.backCardFace;

    if (backCardFace === undefined)
      return;

    this.cardDto.backCardFace = backCardFace;

    let frontCardFaceElements: CardFaceElement[] | undefined = this.cardEditor()?.frontCardFaceElements;

    if (frontCardFaceElements === undefined)
      return;

    this.cardDto.frontCardFaceElements = frontCardFaceElements;

    let backCardFaceElements: CardFaceElement[] | undefined = this.cardEditor()?.backCardFaceElements;

    if (backCardFaceElements === undefined)
      return;

    this.cardDto.backCardFaceElements = backCardFaceElements;
  });

  // ASSUMPTIONS
  // Empty card faces have already been made and will be used to assign to currentCardFace
  // Card face probably has an associated dimension with it
  currentCardFace: CardFace | Partial<CardFace> | undefined = {
    cardFaceId: -1,
    style: {
      styleId: 0,
      aspectRatio: "63/88",
    },
  }

  // TODO: Use the CardFaceElementApiService in the constructor then, if it's a valid card face ID

  // TODO: Replace with actual owner ID
  // TODO: Have extended interfaces instead actually use what they're extending as a property
  // TODO: Grab the width and height of the faces and set them for the cardDto

  // FIXME: Property 'dndItem' does not exist on type 'CardFaceElement'.
  /*
  src/app/features/card-game-core/components/card-editor/card-editor.component.html:35:60:
      35 │ ...yle.left.px]="currentCardFaceElement.dndItem?.dndPosition?.x ?? 0"
  */

  // FIXME: Reset this everytime you open the card editor via the button on the side
  cardDto: CardDto = {
    card: {
      cardId: 0,
      frontCardFaceId: 0,
      backCardFaceId: -1,
      ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
      isFlipped: false,
    },
    frontCardFace: {
      cardFaceId: 0,
      style: {
        styleId: 0,
        width: '100', // Modify
        height: '100', //Modify
        zIndex: 'inherit',
        border: '2px dotted rgb(204, 204, 204)'
      }
    }, // FIXME: Update the element via finding the card face element ID
    frontCardFaceElementsDto: [
      {
        cardFaceElement: {
          cardFaceElementId: 0,
          cardFaceId: 0,
          cardFaceElementContent: '/alucard-castlevania-nocturne.png',
          cardFaceElementType: 'image',
          style: {
            styleId: 0,
            width: '100',
            height: '100',
            zIndex: 'inherit'
          }
        },
        dndItemDto: {
          dndItem: {
            dndItemId: 0,
            isDraggable: false,
            isDroppable: false
          },
          dndPosition: {
            x: 0, // [style.top.px]="item.y"
            y: 0 // [style.left.px]="item.x"
          },
        },
      },
      {
        cardFaceElement: {
          cardFaceElementId: 1,
          cardFaceId: 0,
          cardFaceElementContent: 'Alucard',
          cardFaceElementType: 'rte',
          style: {
            styleId: 0,
            width: '100',
            height: '100',
            zIndex: 'inherit'
          }
        },
        dndItemDto: {
          dndItem: {
            dndItemId: 0,
            isDraggable: false,
            isDroppable: false
          },
          dndPosition: {
            x: 0, // [style.top.px]="item.y"
            y: 0 // [style.left.px]="item.x"
          }
        },
      }
    ],
    /*frontCardFaceElements: [
      {
        cardFaceElementId: 0,
        cardFaceId: 0,
        cardFaceElementContent: '/alucard-castlevania-nocturne.png',
        cardFaceElementType: 'image',
      },
      {
        cardFaceElementId: 1,
        cardFaceId: 0,
        cardFaceElementContent: 'Alucard',
        cardFaceElementType: 'rte',
      }
    ],*/
    backCardFace: {
      cardFaceId: -1,
      style: {
        styleId: 0,
        width: '100', // Modify
        height: '100', //Modify
        zIndex: 'inherit',
        border: '2px dotted rgb(204, 204, 204)'
      }
    },
    backCardFaceElements: [

    ],
    backCardFaceElementsDto: [

    ]
  };

  isFlipped: boolean = this.cardDto.card.isFlipped ?? false;

  cardEditorFaceStyle: Omit<Style, 'styleId'> = {
    aspectRatio: '63/88',
    // height: '80%',
    minHeight: '80%',
    display: 'block',
    position: 'relative',
    borderRadius: '4px',
    /*overflow: hidden;*/
    border: 'dotted #ccc 2px'
  }

  getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return this.cardEditorFaceStyle;
  }

  // TODO: If style of card face is passed in, get the aspect ratio and set the card editor face style
  setCardEditorFaceStyle(style?: Style): void {
    let placeholder: Style = {
      styleId: 0,
      aspectRatio: '63/88',
      minHeight: '80%',
      display: 'block',
      borderRadius: '4px',
      /*overflow: hidden;*/
      border: 'dotted #ccc 2px',
      fontSize: '14px'
    }

    if (style) {
      placeholder = {
        ...style,
        aspectRatio: (style.width && style.height) ? convertToRelativeDimensions({ width: style.width, height: style.height }) : '63/88',
        width: '',
        height: ''
      }
    }
    this.cardEditorFaceStyle = placeholder;
  }

  getCardFaceClientRect() {
    return this.cardEditorFaceRef.nativeElement.getBoundingClientRect();
  }

  // initialPosition: DndPosition = {x: 0, y: 0};

  // TODO: Get rid of all references to currentCardFaceElements
  currentCardFaceElementsDto: CardFaceElementDto[] = [

  ];

  // [cdkDropListConnectedTo]="[cardEditorFace]"
  // TODO: Remove these values as this is temporary
  currentCardFaceElements: CardFaceElement[] = [
  ];

  getCardFaceElementsDtoByCardFaceId(currentCardFaceId: number): Partial<CardFaceElementDto>[] | (CardFaceElementDto | undefined)[] | undefined {
    if (this.cardDto.frontCardFace === undefined || this.cardDto.backCardFace === undefined)
      return undefined;

    if (this.cardDto.frontCardFace.cardFaceId === currentCardFaceId) {
      return this.cardDto.frontCardFaceElementsDto;
    }

    if (this.cardDto.backCardFace.cardFaceId === currentCardFaceId) {
      return this.cardDto.backCardFaceElementsDto;
    }

    return undefined;
  }

  setCurrentCardFaceElementsDto(): void {
    if (this.currentCardFace === undefined || this.currentCardFace.cardFaceId === undefined)
      return;

    let cardFaceElementsDto: Partial<CardFaceElementDto>[] | (CardFaceElementDto | undefined)[] | undefined = this.getCardFaceElementsDtoByCardFaceId(this.currentCardFace.cardFaceId);

    if (cardFaceElementsDto !== null)
      this.currentCardFaceElementsDto = cardFaceElementsDto as CardFaceElementDto[];
  }

  getCardFaceElementsByCardFaceId(currentCardFaceId: number): Partial<CardFaceElement>[] | (CardFaceElement | undefined)[] | undefined {
    if (this.cardDto.frontCardFace === undefined || this.cardDto.backCardFace === undefined)
      return undefined;

    if (this.cardDto.frontCardFace.cardFaceId === currentCardFaceId) {
      return this.cardDto.frontCardFaceElements;
    }

    if (this.cardDto.backCardFace.cardFaceId === currentCardFaceId) {
      return this.cardDto.backCardFaceElements;
    }

    return undefined;
  }

  setCurrentCardFaceElements(): void {
    if (this.currentCardFace === undefined || this.currentCardFace.cardFaceId === undefined)
      return;

    let cardFaceElements: Partial<CardFaceElement>[] | (CardFaceElement | undefined)[] | undefined = this.getCardFaceElementsByCardFaceId(this.currentCardFace.cardFaceId);

    if (cardFaceElements !== null)
      this.currentCardFaceElements = cardFaceElements as CardFaceElement[];
  }

  position: DndPosition = { x: 0, y: 0 };

  // TODO: Use ngx-color-picker for picking colors on the card face

  private _currentPopupMenu: number | null = 0;


  flip(event: Event): void {
    if (this.currentCardFace === undefined || this.currentCardFace.cardFaceId === undefined)
      return;

    this.updateCardFaceElementsDto(this.currentCardFace.cardFaceId);

    this.isFlipped = !this.isFlipped;
    this.currentCardFace = (this.isFlipped) ? this.cardDto.backCardFace as CardFace | undefined : this.cardDto.frontCardFace as CardFace | undefined; // (this.isFlipped) ? this.scaleCardFaceDimensions(this.cardDto.backCardFace) : this.scaleCardFaceDimensions(this.cardDto.frontCardFace);

    if (this.currentCardFace === undefined || this.currentCardFace.cardFaceId === undefined)
      return;

    let cardFaceElementsDto: CardFaceElementDto[] | undefined = this.getCardFaceElementsDtoByCardFaceId(this.currentCardFace.cardFaceId) as CardFaceElementDto[] | undefined;

    if (cardFaceElementsDto)
      this.currentCardFaceElementsDto = cardFaceElementsDto;
  }

  scaleCardFaceDimensions(cardFace: CardFace): CardFace {
    if (cardFace.style.width === undefined || cardFace.style.height === undefined)
      return cardFace;

    let cardFaceScaled: CardFace = {
      ...cardFace,
      style: {
        width: '',
        height: '',
        aspectRatio: convertToRelativeDimensions({ width: cardFace.style.width, height: cardFace.style.height }),
        styleId: 0
      }
    }

    return cardFaceScaled;
  }

  onDragStarted(event: CdkDragStart<any>): void {
    console.log(`Initial starting free drag position - X: ${event.source.getFreeDragPosition().x}, Y: ${event.source.getFreeDragPosition().x}`);
  }

  // TODO: Merge with on drag Start
  changeZIndex(event: CdkDragStart<any>, item: any) {
    // Essentially 
    let cardEditorFaceZIndex = window.getComputedStyle(this.cardEditorFaceRef.nativeElement).zIndex;
    // TODO: Change this to currentCardFaceElementsDto
    this.currentCardFaceElementsDto.forEach(elem => {
      if (elem && elem.cardFaceElement.style) { // Ensure elem and elem.cardFaceElement.style are defined
        elem.cardFaceElement.style['zIndex'] = (elem === item ? (cardEditorFaceZIndex + 1) : 'inherit');
      }
    });
  }

  onDragMoved(event: CdkDragMove<any>): void {
    // Calculates relative position of pointer in container
    // FIXME: I think the fact that the pointer is at the cursor might be causing issues
    let container = this.getCardFaceClientRect();
    let pointerPosition = event.pointerPosition;
    let scale: DndPosition = { x: event.pointerPosition.x - container.left, y: event.pointerPosition.y - container.top };

    // console.log(`Pointer position: ${pointerPosition.x}, ${pointerPosition.y}\nContainer width and height: ${container.width}, ${container.height}, Scale: ${scale.x}, ${scale.y}`);

    // CHECKME: Not sure if this is even necessary
    scale.x = Math.max(0, Math.min(scale.x, container.width));
    scale.y = Math.max(0, Math.min(scale.y, container.height));

    this.position = scale;
  }

  // TODO: Make sure that when you're updating a card face, convert the card face elements from % to px

  // https://stackoverflow.com/questions/69932412/free-drag-with-cdkdroplist
  // https://stackblitz.com/edit/angular-ivy-2imxxu?file=src%2Fapp%2Fapp.component.ts

  // HTML
  //  (cdkDragEnded)="onDragEnded($event)"

  onDragEnded(event: CdkDragEnd): void {
    // TODO: On drag end, update the item's position, grab event.source.data, get the ID, find the cardFaceElementId in the currentCardFaceElements, then update its positioning
    let viewportPoint: DndPosition = { x: event.source.getFreeDragPosition().x, y: event.source.getFreeDragPosition().y };

    console.log(`Final free drag position - X: ${event.source.getFreeDragPosition().x}, Y: ${event.source.getFreeDragPosition().y}`);

    // It's measuring from the top left corner of our dragged item
    // Card corners
    // top-left: 0, 0
    // top-right: 441.84, 0
    // bottom-left: 0, 615.59
    // bottom-right: 441.84, 615.59
    let rect = this.getCardFaceClientRect();
    console.log('Size in onDragEnded:', rect.width, rect.height);

    let position: DndPosition = convertToRelativeCoordinates(viewportPoint, this.cardEditorFaceRef, true);

    console.log(`Dragged item: ${event.source.data} \nX: ${viewportPoint.x}, Y: ${viewportPoint.y}\nX: ${position.x}%, Y: ${position.y}%`);

    // TODO: Fix this, use isCardFaceElementDto
    // TODO: Check to see if it's a card face element
    if (isCardFaceElementDto(event.source.data)) {
      let item = event.source.data;
      item.dndItemDto.dndPosition = position;

      // TODO: Update inside of card face elements, figure out specific card face and then get the card face elements from there
      if (this.updateCardFaceElementDto(this.cardDto.frontCardFaceElementsDto, item)) {
        return;
      }

      this.updateCardFaceElementDto(this.cardDto.backCardFaceElementsDto, item);
    }
  }

  // TODO: Temporary, merge it as a function overload with onDragEnded
  onDragDropped(event: CdkDragDrop<any>) {
    // TODO: Replace field with event.item.data
    // TODO: Replace cardFaceElement with the cardFaceElementDto

    if (!isCardFaceElementDto(event.item.data))
      return;

    console.log(`Drop point: ${event.dropPoint.x}, ${event.dropPoint.y}`);

    let rect = this.getCardFaceClientRect();
    /* let item = event.item.element.nativeElement.getBoundingClientRect();

   let scaleY = item.height / rect.height;
    let scaleX = item.width / rect.width;

    // this._pointerPosition.y-this.off.-this.dropZone.nativeElement
    // pointerPosition uses page coordinate system. This means that the position is measured relative to the top-left corner of the entire rendered document
   // x_local = x_page - x_item
   // y_local = y_page - y_item
    let localDistance: DndPosition = pageToLocalCoordinates(this.cardEditorFaceRef, event.distance.x, event.distance.y, window.scrollX, window.scrollY);
    
    let y: number = +event.dropPoint.x; //+event.item.data.dndPosition.y + (event.distance.y * scaleY);
    let x: number = +event.dropPoint.y; //+event.item.data.dndPosition.x + (event.distance.x * scaleX);

    console.log(`Math: ${+event.item.data.dndPosition.x} + (${event.distance.x} * ${scaleX}), ${+event.item.data.dndPosition.y} + (${event.distance.y} * ${scaleY})\nItem position: ${x}, ${y}\nDrop point: ${event.dropPoint.x}, ${event.dropPoint.y}\nHeight constraint: ${rect.height - item.height}\nWidth constraint: ${rect.width - item.width}`);*/

    // FIXME: Why is it always outside?
    // Might have to create a function for scaling properly?
    // Use pointer position to get exact scale?
    // let out = this.position.y < 0 || this.position.x < 0 || (this.position.y > (rect.height - item.height)) || (this.position.x > (rect.width - item.width));

    let out = this.position.y < 0 || this.position.x < 0 || this.position.y > rect.height || this.position.x > rect.width;


    if (!out) {
      console.log('Not out');

      if (event.item.data.dndItemDto === undefined)
        return;

      event.item.data.dndItemDto.dndPosition = this.position;

      // Tells the currentCardFaceElements how to sort, as in the order
      // FIXME: Whatever's being dragged on top should always be on top
      this.currentCardFaceElementsDto = this.currentCardFaceElementsDto.sort((a, b) => {
        if (a.cardFaceElement.style === undefined || b.cardFaceElement.style === undefined || a.cardFaceElement.style['zIndex'] === undefined || b.cardFaceElement.style['zIndex'] === undefined) return 1;

        return a.cardFaceElement.style['zIndex'] > b.cardFaceElement.style['zIndex']
          ? 1 : a.cardFaceElement.style['zIndex'] < b.cardFaceElement.style['zIndex']
            ? -1 : 0;
      });

      // If it's out, potentially put it to the closest corner?
    }
  }

  onDragDrop(event: CdkDragDrop<any>) {
    // console.log("On drag dropped");

    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  getCardFaceElementDto(cardFaceElementsDto: CardFaceElementDto[], cardFaceElementId: number): CardFaceElementDto | null {
    let cardFaceElementDto: CardFaceElementDto = {
      cardFaceElement: {
        cardFaceElementId: 0,
        cardFaceId: 0,
        cardFaceElementContent: '',
        style: {
          styleId: 0
        }
      },
      dndItemDto: {
        dndItem: {
          dndItemId: 0,
          isDraggable: false,
          isDroppable: false
        },
        dndPosition: {
          x: 0,
          y: 0
        }
      }
    }

    cardFaceElementsDto.forEach(element => {
      console.log(`Get card face element - Element ID: ${element.cardFaceElement.cardFaceElementId}`);
      if (element.cardFaceElement.cardFaceElementId === cardFaceElementId) {
        cardFaceElementDto = element;
        console.log(`Get card face element:\nCard face element: ${JSON.stringify(cardFaceElementDto)}\nElement: ${JSON.stringify(element)}`);
        return;
      }
    });

    if (!cardFaceElementDto)
      return null;

    console.log(`Get card face element: ${JSON.stringify(cardFaceElementDto)}`);

    return cardFaceElementDto;
  }

  updateCardFaceElementDto(cardFaceElementsDto: CardFaceElementDto[] | Partial<CardFaceElementDto>[] | undefined, cardFaceElementDto: CardFaceElementDto): boolean {
    let hasUpdated: boolean = false;

    if (cardFaceElementsDto === undefined)
      return hasUpdated;

    cardFaceElementsDto.map(e => {
      if (e.cardFaceElement && e.cardFaceElement.cardFaceElementId === cardFaceElementDto.cardFaceElement.cardFaceElementId) {
        console.log('CFE: ', JSON.stringify(cardFaceElementDto));

        e = {
          ...cardFaceElementDto
        };

        hasUpdated = true;
        return;
      }
    });

    return hasUpdated;
  }

  // ASSUMPTION: Set the currentCardFaceElements to be the card face element
  updateCardFaceElementsDto(currentCardFaceId: number) {
    if (this.cardDto.frontCardFace === undefined || this.cardDto.backCardFace === undefined)
      return;

    if (this.cardDto.frontCardFace.cardFaceId === currentCardFaceId) {
      this.cardDto.frontCardFaceElementsDto = this.currentCardFaceElementsDto;
      return;
    }

    if (this.cardDto.backCardFace.cardFaceId === currentCardFaceId) {
      this.cardDto.backCardFaceElementsDto = this.currentCardFaceElementsDto;
      return;
    }
  }

  setOnCardFaceModifyBtnText(): void {
    this.onCardFaceModifyBtnText = this.cardDto.card !== undefined && this.cardDto.card.cardId !== undefined && this.cardDto.card.cardId > 0 ? 'Save' : 'Create';
  }

  setCurrentCardFace(frontCardFaceId: number): void {
    if (this.currentCardFace?.cardFaceId == frontCardFaceId) {
      this.currentCardFace = this.cardDto.frontCardFace;
    }
    else
    {
      this.currentCardFace = this.cardDto.backCardFace;
    }
  }

  // TODO: CREATE OR UPDATE DEPENDING ON FACTOR
  onCardFaceModify(event: Event): void {
    if (this.cardDto === undefined || this.cardDto.card === undefined)
      return;

    if (this.cardDto.card.cardId !== undefined && this.cardDto.card.cardId > 0) {
      this.cardApiService.updateCard(
        this.cardDto).subscribe((result: Card | CardDto | void | undefined) => {
          console.log(`On update card: ${(result) ? JSON.stringify(result) : result}`);

          // FIXME: Updating shouldn't be returning anything
          if (isCardDto(result)) {
            this.cardDto = result;

            if (this.cardDto.frontCardFace?.cardFaceId === undefined)
              return;
            
            this.setCurrentCardFace(this.cardDto.frontCardFace?.cardFaceId);
            this.setCurrentCardFaceElementsDto();
          }
        });
    }

    console.log("Create or save");
    this.currentCardFaceElementsDto.forEach((currentCardFaceElementDto) => {
      if (currentCardFaceElementDto.dndItemDto.dndItem)
        console.log(`Relative coordinates: ${JSON.stringify(convertToRelativeCoordinates(currentCardFaceElementDto.dndItemDto.dndPosition, this.cardEditorFaceRef))}`);
    });

    if (this.cardDto.frontCardFace !== undefined && this.cardDto.backCardFace !== undefined &&
      this.cardDto.frontCardFace.cardFaceId !== 0 && this.cardDto.backCardFace.cardFaceId !== -1) {
      console.log("Update card and get the card");
      return;
    }

    let cardDtoOmitPks: CardDto = this.omitCardDtoPks(this.cardDto);

    this.cardApiService.createCard(this.cardDto
        /*cardDtoOmitPks*/).subscribe((result: Card | CardDto | undefined) => {
      console.log(`On create card: ${(result) ? JSON.stringify(result) : result}`);

      if (isCardDto(result)) {
        this.cardDto = result;

        console.log(`Card Dto after create: ${JSON.stringify(this.cardDto)}`);
        
        // FIXED: Need to call this to update the current card face elements DTO

        if (this.currentCardFace?.cardFaceId === undefined)
          return;

        this.setCurrentCardFace(this.currentCardFace?.cardFaceId);
        this.setCurrentCardFaceElementsDto();

        this.setOnCardFaceModifyBtnText();
        console.log(`Card face modify button text: ${this.onCardFaceModifyBtnText}`);
      }
    });
  }

  // FIXME: How to omit the IDs in frontCardFaceElementsDto and backCardFaceElementsDto
  omitCardDtoPks(cardDto: CardDto): CardDto {
    return {
      card: cardDto.card as Partial<Omit<Card, 'cardId'>>,
      frontCardFace: cardDto.frontCardFace as Partial<Omit<CardFace, 'cardFaceId'>>,
      backCardFace: cardDto.backCardFace as Partial<Omit<CardFace, 'cardFaceId'>>,
      frontCardFaceStyle: cardDto.frontCardFaceStyle as Partial<Omit<Style, 'styleId'>>,
      backCardFaceStyle: cardDto.backCardFaceStyle as Partial<Omit<Style, 'styleId'>>,
      frontCardFaceElements: cardDto.frontCardFaceElements?.map(element => {
        let { cardFaceElementId, ...rest } = element as CardFaceElement;
        return rest;
      }) as Array<Partial<Omit<CardFaceElement, 'cardFaceElementId'>>>,
      frontCardFaceElementStyles: cardDto.frontCardFaceElementStyles?.map(style => {
        let { styleId, ...rest } = style as Style;
        return rest;
      }) as Array<Partial<Omit<Style, 'styleId'>>>,
      backCardFaceElements: cardDto.backCardFaceElements?.map(element => {
        let { cardFaceElementId, ...rest } = element as CardFaceElement;
        return rest;
      }) as Array<Partial<Omit<CardFaceElement, 'cardFaceElementId'>>>,
      backCardFaceElementStyles: cardDto.backCardFaceElementStyles?.map(style => {
        let { styleId, ...rest } = style as Style;
        return rest;
      }) as Array<Partial<Omit<Style, 'styleId'>>>,
      dndItem: cardDto.dndItem as Partial<Omit<DndItem, 'dndItemId'>>
    }
  }

  onOpenRteEditor(event: Event, cardFaceElementId: number) {
    this._currentPopupMenu = 1;
    this.isCurrentPopupMenuOpen = true;

    if (cardFaceElementId === undefined)
      return;

    // FIXME: This is not right
    this._cardFaceElementId = cardFaceElementId;
    let cardFaceElementDto: CardFaceElementDto | null = this.getCardFaceElementDto(this.currentCardFaceElementsDto, this._cardFaceElementId);

    if (!cardFaceElementDto)
      return;

    this.popupMenuInputs.htmlContentInput = cardFaceElementDto.cardFaceElement.cardFaceElementContent;
  }

  onOpenImageEditor(cardFaceElementId: number) {
    this._currentPopupMenu = 0;

    this.isCurrentPopupMenuOpen = true;

    if (cardFaceElementId)
      this._cardFaceElementId = cardFaceElementId;
    
    let cardFaceElementDto: CardFaceElementDto | null = this.getCardFaceElementDto(this.currentCardFaceElementsDto, cardFaceElementId);

    this.popupMenuInputs.cardFaceImageAttr = {
      cardFaceImage: {
        imageId: cardFaceElementId,
        src: (cardFaceElementDto?.cardFaceElement.cardFaceElementContent) ? cardFaceElementDto?.cardFaceElement.cardFaceElementContent : '',
        alt: ''
      },
      cardFaceImageStyle: {
        styleId: 0,
        width: '100',
        height: '150',
      }
    };

    // FIXME: Current card face element ID is -1, pass into the app-card-face-image as part of input then pass it back up?
    console.log(`On open image editor current card face element ID: ${this._cardFaceElementId}`);
  }

  onCloseImageEditor(showImageEditor: boolean) {
    this.isCurrentPopupMenuOpen = false;
  }

  // Wait, why store the blob? Wouldn't it change everytime?
  setCardFaceImageElementSrc(croppedImage: string): void {
    alert(`${croppedImage}`);
    // TODO: Find the image being edited, then get that and set the source

    // TEMP

    /*
    ngx-image-cropper.mjs:1314 Error: Invalid image type
    at LoadImageService.checkImageTypeAndLoadImageFromArrayBuffer (ngx-image-cropper.mjs:967:29)
    at LoadImageService.<anonymous> (ngx-image-cropper.mjs:961:25)
    at Generator.next (<anonymous>)
    at fulfilled (chunk-EIJ3YIEK.js?v=2627aefe:36:24)
    at _ZoneDelegate.invoke (zone.js:369:28)
    at Object.onInvoke (core.mjs:6525:25)
    at _ZoneDelegate.invoke (zone.js:368:34)
    at ZoneImpl.run (zone.js:111:43)
    at zone.js:2538:40
    at _ZoneDelegate.invokeTask (zone.js:402:33)
    */

    console.log(this.cardFaceElementRef.nativeElement.attributes);
    // Need to keep track of what item's being modified

    // FIXME: Why is this not being set
    console.log('Card face image element index: ', this._cardFaceElementId);

    // https://stackoverflow.com/questions/51019467/convert-blob-to-image-url-and-use-in-image-src-to-display-image
    let cardFaceElementDto: CardFaceElementDto | null = this.getCardFaceElementDto(this.currentCardFaceElementsDto, this._cardFaceElementId);

    if (!cardFaceElementDto)
      return;

    blobToDataURL(croppedImage).then((base64Image) => {
      cardFaceElementDto.cardFaceElement.cardFaceElementContent = base64Image;

      // console.log("croppedImage:", base64Image); // Check if it starts with "data:image/"

      let updated = this.updateCardFaceElementDto(this.currentCardFaceElementsDto, cardFaceElementDto);

      console.log(`${JSON.stringify(cardFaceElementDto)}, has updated: ${updated}`);

      console.log(`${JSON.stringify(cardFaceElementDto)}, has updated: ${updated}`);
      this.currentCardFaceElements.forEach(i => {
        console.log(`${JSON.stringify(i)}`);
      })
    });
  }

  // Let ID be the index of the item
  getCardFaceImage(id: number, src: string, width?: string, height?: string): Image {
    let image: Image = {
      imageId: id,
      src: src,
      alt: '',
    };

    if (width) {
      image.width = parseCssDimension(width);
    }

    if (height) {
      image.height = parseCssDimension(height);
    }

    console.log('Image', image);

    return image;
  }

  setRteHtmlContent(htmlContent: string) {
    console.log(`RTE HTML content: ${htmlContent}`)
    this.isCurrentPopupMenuOpen = false;

    console.log('Current element index: ', this._cardFaceElementId);

    // https://stackoverflow.com/questions/51019467/convert-blob-to-image-url-and-use-in-image-src-to-display-image
    let cardFaceElementDto: CardFaceElementDto | null = this.getCardFaceElementDto(this.currentCardFaceElementsDto, this._cardFaceElementId);

    console.log('Card face element: ', JSON.stringify(cardFaceElementDto));

    if (!cardFaceElementDto)
      return;

    cardFaceElementDto.cardFaceElement.cardFaceElementContent = htmlContent;

    let hasUpdated: boolean = this.updateCardFaceElementDto(this.currentCardFaceElementsDto, cardFaceElementDto);

    console.log('Has updated: ', hasUpdated);
    // this._cdr.detectChanges();
  }

  createCardFaceRte(htmlContent: string): AngularEditorConfig {
    /*
    https://stackoverflow.com/questions/72590829/convert-all-occurrences-of-px-to-rem-for-responsive-design
    body {

 font-size: 0.625rem; 

{

Now 1 rem will be equal to 10 px

    Conversion: 1.6
    1 rem/10 px
    0.625 rem/6.25px
    8.75rem/14px
    */

    // FIXME: Undefined native element
    // Passing in elements from something before it's done rendering
    // let maxHeight: number = this.getCardFaceClientRect();.y/1.6;

    let aec: AngularEditorConfig = {
      // Properties from AngularEditorConfig
      editable: false,
      spellcheck: true,
      height: 'fit-content',
      minHeight: '1rem',
      // defaultFontSize: '14px',
      maxHeight: '4rem',
      // maxHeight: `${maxHeight}rem`,
      // width: 'fit-content',
      enableToolbar: false,
      showToolbar: false,
      placeholder: htmlContent,
      outline: false
    };

    return aec;
  }

  // Open the popup menu
  getCurrentPopupMenuComponent(): Type<any> | null {
    switch (this._currentPopupMenu) {
      case 0:
        return CardFaceImageEditorComponent; // TODO: Replace with CardFaceImageEditor
      case 1:
        return CardFaceRteComponent;
      default: // CHECKME: Would this break the page
        return null;
    }
  }

  // FIXME: Replace event.item.data because it's gonna get the DTO, not the actual element itself
  onCreateDragDropped(event: CdkDragDrop<any>) {
    // console.log('Create drag dropped');
    // FIXME: Why does it think that it's being dragged to the other container
    if (event.previousContainer !== event.container) {
      // console.log('Transfer array item and read it');
      let cont = event.container.element.nativeElement.getBoundingClientRect();



      // TODO: out should be its own function
      let container = this.getCardFaceClientRect();

      let dndPosition: DndPosition = {
        x: event.dropPoint.x - container.left,
        y: event.dropPoint.y - container.top
      };

      console.log(`Palette drop point: ${event.dropPoint.x}, ${event.dropPoint.y}`);
      // 703, 180

      let out = dndPosition.y < 0 || dndPosition.x < 0 || dndPosition.y > container.height || dndPosition.x > container.width;

      if (out)
        return;

      /*
      event.item.data.y=(event.dropPoint.y-this.off.y*this.scaleY-this.dropZone.nativeElement.getBoundingClientRect().top)
      event.item.data.x=(event.dropPoint.x-this.off.x*this.scaleX-this.dropZone.nativeElement.getBoundingClientRect().left)
      this.changeZIndex(event.item.data)
      */

      if (this.currentCardFace === undefined) {
        console.log(`onCreateDragDropped current card face is undefined`);
        return;
      }

      /*let cardFaceElement: CardFaceElement = {
        cardFaceElementId: 0,
        cardFaceId: 0,
        cardFaceElementContent: ''
      };*/

      // TODO: Use this, separate out the items
      let cardFaceElementDto: CardFaceElementDto = {
        cardFaceElement: {
          cardFaceElementId: 0,
          cardFaceId: 0,
          cardFaceElementContent: '',
          style: {
            styleId: 0
          }
        },
        dndItemDto: {
          dndItem: {
            dndItemId: 0,
            isDraggable: false,
            isDroppable: false,
          },
          dndPosition: dndPosition
        }
      }

      // TODO: When saving, convert the dndPosition to be something that's savable and percentage based
      // TODO: Make a new cardFaceElementDto, not cardFaceElement
      switch (event.item.data) {
        case 'rte':
          /*cardFaceElement = {
            cardFaceElementId: this.currentCardFaceElements.length,
            cardFaceId: this.currentCardFace.cardFaceId as number,
            cardFaceElementContent: '',
            cardFaceElementType: 'rte'
          };*/

          cardFaceElementDto = {
            cardFaceElement: {
              cardFaceElementId: this.currentCardFaceElementsDto.length,
              cardFaceId: this.currentCardFace.cardFaceId as number,
              cardFaceElementContent: '',
              cardFaceElementType: 'rte',
              style: {
                styleId: 0,
                width: 'fit-content', // Modify
                height: 'fit-content', //Modify
                zIndex: 'inherit'
              }
            },
            dndItemDto: {
              dndItem: {
                dndItemId: 0,
                isDraggable: false,
                isDroppable: false,
              },
              dndPosition: dndPosition
            }
          };
          break;
        case 'image':
          /*cardFaceElement = {
            cardFaceElementId: this.currentCardFaceElements.length,
            cardFaceId: this.currentCardFace.cardFaceId as number,
            cardFaceElementContent: 'https://www.charitycomms.org.uk/wp-content/uploads/2019/02/placeholder-image-square.jpg',
            cardFaceElementType: 'image'
          };*/

          cardFaceElementDto = {
            cardFaceElement: {
              cardFaceElementId: this.currentCardFaceElementsDto.length,
              cardFaceId: this.currentCardFace.cardFaceId as number,
              cardFaceElementContent: 'https://www.charitycomms.org.uk/wp-content/uploads/2019/02/placeholder-image-square.jpg',
              cardFaceElementType: 'image',
              style: {
                styleId: 0,
                width: '100', // Modify
                height: '100', //Modify
                zIndex: 'inherit'
              }
            },
            dndItemDto: {
              dndItem: {
                dndItemId: 0,
                isDraggable: false,
                isDroppable: false,
              },
              dndPosition: dndPosition
            }
          };
          break;
        default:
          console.log("Default");
          break;
      }

      // this.currentCardFaceElements.push(cardFaceElement);
      this.currentCardFaceElementsDto.push(cardFaceElementDto);
      console.log("Added new component: ", JSON.stringify(this.currentCardFaceElementsDto));
    }
  }
}
