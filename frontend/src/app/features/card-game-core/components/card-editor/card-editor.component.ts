import { AfterViewInit, Component, computed, ElementRef, inject, input, Type, ViewChild, WritableSignal, Injector, ChangeDetectorRef, InputSignal, Signal, effect } from '@angular/core';
import { CardEditorCardFaceDto, CardFace } from '../../models/card-face';
import { Card, CardEditorCardDto } from '../../models/card';
import { CdkDrag, DragDropModule, CdkDragHandle, CdkDragMove, CdkDragEnd, Point, DragRef, CdkDragStart, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
/*import { CardFaceElementApiService } from '../../services/card-face-element-api.service';
import { CardApiService } from '../../services/card-api.service';
import { CardFaceApiService } from '../../services/card-face-api.service';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';
import { CardFaceImageEditorComponent } from '../card-face-image-editor/card-face-image-editor.component';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';
import { FileUploadComponent } from '../../../../utils/components/file-upload/file-upload.component';
import { DomSanitizer } from '@angular/platform-browser';*/
import { CardFaceElement, CardFaceElementDto, CardFaceElementPerCardFace, CardFaceRte } from '../../models/card-face-element';
import { convertToRelativeDimensions } from '../../../style/utils/convert-dimensions.utils';

import { Image } from '../../../style/models/image';
import { Style } from '../../../style/models/style';
import { convertToRelativeCoordinates, pageToLocalCoordinates } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { isDndItem } from '../../../drag-and-drop/utils/dnd-item.utils';
import {isCardEditorCardDto, isCardFaceElement, isCardFaceElementPerCardFace } from '../../utils/card-game-core.utils';
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
import { CardApiService } from '../../services/card-game-core/card-api.service';
import { CardFaceApiService } from '../../services/card-game-core/card-face-api.service';
import { CardFaceElementApiService } from '../../services/card-game-core/card-face-element-api.service';
import { DndItem } from '../../../drag-and-drop/models/dnd-item';
import html2canvas from 'html2canvas';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { getCrypto } from '../../../drag-and-drop/utils/crypto.utils';
import { catchError, concatMap, EMPTY, forkJoin, from, map, mergeMap, Observable, ObservedValueOf, of, pipe, switchMap, tap } from 'rxjs';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { T } from '@angular/cdk/keycodes';

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
  private cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private cardApiService: CardApiService = inject(CardApiService);
  private fileUploadApiService = inject(FileUploadApiService);

  /*private fileUploadComponent = inject(FileUploadComponent);
  private domSanitizer = inject(DomSanitizer);*/

  @ViewChild('cardEditorFace') cardEditorFaceRef!: ElementRef;
  @ViewChild('cardFaceElement') cardFaceElementRef!: ElementRef;
  
  /*
  @ViewChild('frontCardFaceRef') frontCardFaceRef!: ElementRef;
  @ViewChild('backCardFaceRef') backCardFaceRef!: ElementRef;
  
  @ViewChild('frontCardFaceCanvas') frontCardFaceCanvas!: ElementRef;
  @ViewChild('backCardFaceCanvas') backCardFaceCanvas!: ElementRef;
  */
  
  private currentCardFaceElementId: number = -1;

  onCardFaceModifyBtnText: string = "Create";

  constructor() {
    effect(() => {
      if (this.cardGameCoreService.cardEditorCardDto().card.cardId !== undefined && this.cardGameCoreService.cardEditorCardDto().card.cardId as number > 0) {
        this.setCardEditorCardDto(this.cardGameCoreService.cardEditorCardDto());
      }
    });

    this.setCurrentCardEditorCardFaceDto();
    this.setCurrentCardFaceElementsPerCardFace();
  }

  ngAfterViewInit(): void {
    let rect = this.getCardFaceClientRect();
    // console.log('Size after view init:', rect.width, rect.height);

    let width: string = `${rect.width}px`;
    let height: string = `${rect.height}px`;

    this.updateCardFaceDimensions(width, height);
  }

  setCardEditorCardDto(newCardEditorCardDto: CardEditorCardDto) {
    if (!newCardEditorCardDto || newCardEditorCardDto.card.cardId === undefined || newCardEditorCardDto.card.cardId < 0) return;
      this.cardEditorCardDto = newCardEditorCardDto;
  }

  private updateCardFaceDimensions(width: string, height: string) {
    this.cardEditorCardDto.cardEditorCardFacesDto?.forEach((cfd: CardEditorCardFaceDto) => {
      cfd.cardFace.style.width = width;
      cfd.cardFace.style.height = height;
    });
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

  // ASSUMPTIONS
  // Empty card faces have already been made and will be used to assign to currentCardEditorCardFaceDto
  // Card face probably has an associated dimension with it
  currentCardEditorCardFaceDto: CardEditorCardFaceDto= {
    cardFace: {
      cardFaceId: 0,
      style: {
        styleId: 0
      }
    },
    cardFaceElementsPerCardFace: []
  };

  // TODO: Use the CardFaceElementApiService in the constructor then, if it's a valid card face ID

  // TODO: Replace with actual owner ID
  // TODO: Have extended interfaces instead actually use what they're extending as a property
  // TODO: Grab the width and height of the faces and set them for the cardEditorCardDto

  // FIXME: Reset this everytime you open the card editor via the button on the side
  cardEditorCardDto: CardEditorCardDto = {
    card: {
      cardId: 0,
      currentCardFaceIndex: 0,
      cardName: ''
    },
    ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
    cardEditorCardFacesDto: [
      {
        cardFace: {
          cardFaceId: 0,
          style: {
            styleId: 0,
            width: '100', // Modify
            height: '100', //Modify
            zIndex: 'inherit',
            border: '2px dotted rgb(204, 204, 204)'
          },
          cardFaceThumbnailFilePath: ''
        },
        cardFaceElementsPerCardFace: [
          /*{
            cardFaceElement: {
              cardFaceElementId: 0,
              cardFaceElementContent: '/alucard-castlevania-nocturne.png',
              cardFaceElementType: 'image',
              style: {
                styleId: 0,
                width: '100',
                height: '100',
                zIndex: 'inherit'
              }
            },
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
          {
            cardFaceElement: {
              cardFaceElementId: 1,
              cardFaceElementContent: 'Alucard',
              cardFaceElementType: 'rte',
              style: {
                styleId: 0,
                width: '100',
                height: '100',
                zIndex: 'inherit'
              }
            },
            dndItem: {
              dndItemId: 0,
              isDraggable: false,
              isDroppable: false
            },
            dndPosition: {
              x: 0, // [style.top.px]="item.y"
              y: 0 // [style.left.px]="item.x"
            }
          }*/
        ]
      },
      {
        cardFace: {
          cardFaceId: -1,
          style: {
            styleId: 0,
            width: '100', // Modify
            height: '100', //Modify
            zIndex: 'inherit',
            border: '2px dotted rgb(204, 204, 204)'
          },
          cardFaceThumbnailFilePath: ''
        },
        cardFaceElementsPerCardFace: []
      }
    ]
  };

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

  currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = [

  ];

  setCurrentCardFaceElementsPerCardFace(): void {
    this.currentCardFaceElementsPerCardFace = this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace;
    
    // console.log(`Set current card face elements per card face: ${JSON.stringify(this.currentCardFaceElementsPerCardFace)}`);
  }

  position: DndPosition = {
    x: 0, y: 0,
    dndPositionId: 0
  };

  // TODO: Use ngx-color-picker for picking colors on the card face

  private currentPopupMenu: number | null = 0;

  private updateCardFaceImages$(cardFaceIndexToTakeImageOf: number): Observable<FormData[]> {
    return from(this.flattenCardFaceToImage()).pipe(
      map((value: FormData) => {
        // Clone the array to avoid mutating the original if needed
        // console.log('Card face images on flip - index to store image:', cardFaceIndexToTakeImageOf);
        // console.log('Card face images on flip - before assignment:', this.cardFaceImages);
        this.cardFaceImages[cardFaceIndexToTakeImageOf] = value;

      // console.log(`Card face images on flip - after assignment:: ${JSON.stringify(this.cardFaceImages)}`);
      return this.cardFaceImages
      })
    );
  }

  flip(event: Event): void {
    this.updateCardFaceElementsPerCardFace();

    let cardFaceIndexToTakeImageOf: number = this.cardEditorCardDto.card.currentCardFaceIndex;
    
    // ASSUMPTION: If there's no elements in the card face, don't make an image because there's no point of saving a blank card
    if (this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace.length > 0)
      this.updateCardFaceImages$(cardFaceIndexToTakeImageOf);

    this.cardEditorCardDto.card.currentCardFaceIndex = (this.cardEditorCardDto.card.currentCardFaceIndex == 0) ? 1 : 0;
    this.setCurrentCardEditorCardFaceDto();
    this.setCurrentCardFaceElementsPerCardFace();
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
    // console.log(`Initial starting free drag position - X: ${event.source.getFreeDragPosition().x}, Y: ${event.source.getFreeDragPosition().x}`);
  }

  // TODO: Merge with on drag Start
  changeZIndex(event: CdkDragStart<any>, item: any) {
    // Essentially 
   /* let cardEditorFaceZIndex = window.getComputedStyle(this.cardEditorFaceRef.nativeElement).zIndex;
    this.currentCardFaceElementsPerCardFace.forEach(elem => {
      if (elem && elem.cardFaceElement.style) { // Ensure elem and elem.cardFaceElement.style are defined
        elem.cardFaceElement.style['zIndex'] = (elem === item ? (cardEditorFaceZIndex + 1) : 'inherit');
      }
    });*/
  }

  onDragMoved(event: CdkDragMove<any>): void {
    // Calculates relative position of pointer in container
    // FIXME: I think the fact that the pointer is at the cursor might be causing issues
    let container = this.getCardFaceClientRect();
    let pointerPosition = event.pointerPosition;
    let scale: DndPosition = {
      x: event.pointerPosition.x - container.left, y: event.pointerPosition.y - container.top,
      dndPositionId: 0
    };

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
    let viewportPoint: DndPosition = {
      x: event.source.getFreeDragPosition().x, y: event.source.getFreeDragPosition().y,
      dndPositionId: 0
    };

    // console.log(`Final free drag position - X: ${event.source.getFreeDragPosition().x}, Y: ${event.source.getFreeDragPosition().y}`);

    // It's measuring from the top left corner of our dragged item
    // Card corners
    // top-left: 0, 0
    // top-right: 441.84, 0
    // bottom-left: 0, 615.59
    // bottom-right: 441.84, 615.59
    let rect = this.getCardFaceClientRect();
    // console.log('Size in onDragEnded:', rect.width, rect.height);

    let position: DndPosition = convertToRelativeCoordinates(viewportPoint, this.cardEditorFaceRef, true);

    // console.log(`Dragged item: ${event.source.data} \nX: ${viewportPoint.x}, Y: ${viewportPoint.y}\nX: ${position.x}%, Y: ${position.y}%`);

    if (isCardFaceElementPerCardFace(event.source.data)) {
      let item = event.source.data;
      item.dndPosition = position;

      if (this.updateCardFaceElementPerCardFace(this.currentCardFaceElementsPerCardFace, item)) {
        return;
      }
    }
  }

  // TODO: Temporary, merge it as a function overload with onDragEnded
  onDragDropped(event: CdkDragDrop<any>) {
    if (!isCardFaceElementPerCardFace(event.item.data))
      return;

    // console.log(`Drop point: ${event.dropPoint.x}, ${event.dropPoint.y}`);

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

    // console.log(`Math: ${+event.item.data.dndPosition.x} + (${event.distance.x} * ${scaleX}), ${+event.item.data.dndPosition.y} + (${event.distance.y} * ${scaleY})\nItem position: ${x}, ${y}\nDrop point: ${event.dropPoint.x}, ${event.dropPoint.y}\nHeight constraint: ${rect.height - item.height}\nWidth constraint: ${rect.width - item.width}`);*/

    // FIXME: Why is it always outside?
    // Might have to create a function for scaling properly?
    // Use pointer position to get exact scale?
    // let out = this.position.y < 0 || this.position.x < 0 || (this.position.y > (rect.height - item.height)) || (this.position.x > (rect.width - item.width));

    let out = this.position.y < 0 || this.position.x < 0 || this.position.y > rect.height || this.position.x > rect.width;


    if (!out) {
      // console.log('Not out');

      if (event.item.data.dndPosition === undefined)
        return;

      event.item.data.dndPosition = this.position;

      // Tells the currentCardFaceElements how to sort, as in the order
      // FIXME: Whatever's being dragged on top should always be on top
      /*this.currentCardFaceElementsPerCardFace =this.currentCardFaceElementsPerCardFace.sort((a, b) => {
        if (a.cardFaceElement.style === undefined || b.cardFaceElement.style === undefined || a.cardFaceElement.style['zIndex'] === undefined || b.cardFaceElement.style['zIndex'] === undefined) return 1;

        return a.cardFaceElement.style['zIndex'] > b.cardFaceElement.style['zIndex']
          ? 1 : a.cardFaceElement.style['zIndex'] < b.cardFaceElement.style['zIndex']
            ? -1 : 0;
      });*/

      // If it's out, potentially put it to the closest corner?
    }
  }

  onDragDrop(event: CdkDragDrop<any>) {
    // console.log("On drag dropped");

    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  getCardFaceElementPerCardFace(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementId: number): CardFaceElementPerCardFace | null {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = {
      cardFaceElement: {
        cardFaceElementId: 0,
        cardFaceElementContent: '',
        style: {
          styleId: 0
        }
      },
      dndItem: {
        dndItemId: 0,
        isDraggable: false,
        isDroppable: false
      },
      dndPosition: {
        x: 0,
        y: 0,
        dndPositionId: 0
      }
    };

    let value = cardFaceElementsPerCardFace.find(
      element => element.cardFaceElement.cardFaceElementId === cardFaceElementId
    );

    if (value !== undefined)
      cardFaceElementPerCardFace = value;

    // console.log(`Get card face element per card face: ${JSON.stringify(cardFaceElementsPerCardFace)}`);

    return cardFaceElementPerCardFace;
  }

  updateCardFaceElementPerCardFace(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementPerCardFace: CardFaceElementPerCardFace): boolean {
    let index = cardFaceElementsPerCardFace.findIndex(
      (element: CardFaceElementPerCardFace) => element.cardFaceElement.cardFaceElementId === cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId
    );
  
    if (index > -1) {
      cardFaceElementsPerCardFace[index] = { ...cardFaceElementPerCardFace };
      
      // console.log(`Update card face element per card face - true: ${JSON.stringify(cardFaceElementsPerCardFace)}`);
      return true;
    }

    // console.log(`Update card face element per card face - false: ${JSON.stringify(cardFaceElementsPerCardFace)}`);
    return false;
  }

  // ASSUMPTION: Set the currentCardFaceElements to be the card face element
  updateCardFaceElementsPerCardFace() {
    // console.log(`Update card face elements per card face: ${JSON.stringify(this.currentCardFaceElementsPerCardFace)}`);

    this.cardEditorCardDto.cardEditorCardFacesDto[this.cardEditorCardDto.card.currentCardFaceIndex].cardFaceElementsPerCardFace = this.currentCardFaceElementsPerCardFace;
  }

  setOnCardFaceModifyBtnText(): void {
    this.onCardFaceModifyBtnText = this.cardEditorCardDto.card !== undefined && this.cardEditorCardDto.card.cardId !== undefined && this.cardEditorCardDto.card.cardId > 0 ? 'Save' : 'Create';
  }

  // TODO: Modify this for if there's more than 2 card faces
  setCurrentCardEditorCardFaceDto(): void {
    this.currentCardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.cardEditorCardDto.card.currentCardFaceIndex];
  
    // console.log(`Set current card editor card face DTO: ${JSON.stringify(this.currentCardEditorCardFaceDto)}`);
  }

  updateCard(): void {
    // TODO: Have a check to only take a picture when there's actually changes to the card face
    // Take current card face index, use that to compare current card face and information for that card face
    // If they're different, take a picture

    this.cardApiService.updateCard$(
      this.cardEditorCardDto).subscribe((result: Card | CardEditorCardDto | void | undefined) => {
        // console.log(`On update card: ${(result) ? JSON.stringify(result) : result}`);

        // FIXME: Updating shouldn't be returning anything
        if (isCardEditorCardDto(result)) {
          this.cardEditorCardDto = result;
          
          this.setCurrentCardEditorCardFaceDto();
          this.setCurrentCardFaceElementsPerCardFace();
        }
      });
  }

  // TODO: CREATE OR UPDATE DEPENDING ON FACTOR
  onCardFaceModify(event: Event): void {
    if (this.cardEditorCardDto === undefined || this.cardEditorCardDto.card === undefined)
      return;

    this.updateCardFaceImages$(0).subscribe((imagesFormData: FormData[]) => {
      // TODO: Have a preview image for the face that's not being looked at, that will be where the canvases will be stored and draw from
      // TODO: Check to make sure that the card faces remain the same, if they don't remain the same, then continue on

      // TODO: If the card was blank and updated, then create a new card, get the card ID to determine what to do
      if (this.cardEditorCardDto.card.cardId > 0) {
        this.updateCard();
        return;
      }

      this.createCard();
    });
  }

  onOpenRteEditor(event: Event, cardFaceElementId: number) {
    this.currentPopupMenu = 1;
    this.isCurrentPopupMenuOpen = true;

    if (cardFaceElementId === undefined)
      return;

    // FIXME: This is not right
    this.currentCardFaceElementId = cardFaceElementId;
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | null = this.getCardFaceElementPerCardFace(this.currentCardFaceElementsPerCardFace, this.currentCardFaceElementId);

    if (!cardFaceElementPerCardFace)
      return;

    this.popupMenuInputs.htmlContentInput = cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent;
  }

  onOpenImageEditor(cardFaceElementId: number) {
    // console.log(`On open image editor: ${JSON.stringify(this.currentCardFaceElementsPerCardFace,)}`);
    
    this.currentPopupMenu = 0;

    this.isCurrentPopupMenuOpen = true;

    this.currentCardFaceElementId = cardFaceElementId;
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | null = this.getCardFaceElementPerCardFace(this.currentCardFaceElementsPerCardFace, this.currentCardFaceElementId);

    if (!cardFaceElementPerCardFace)
      return;

    this.popupMenuInputs.cardFaceImageAttr = {
      cardFaceImage: {
        imageId: cardFaceElementId,
        src: cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent,
        alt: ''
      },
      cardFaceImageStyle: {
        styleId: 0,
        width: '100',
        height: '150',
      }
    };

    // FIXME: Current card face element ID is -1, pass into the app-card-face-image as part of input then pass it back up?
    // console.log(`On open image editor current card face element ID: ${this.currentCardFaceElementId}`);
  }

  onCloseImageEditor(showImageEditor: boolean) {
    this.isCurrentPopupMenuOpen = false;
  }

  // Wait, why store the blob? Wouldn't it change everytime?
  setCardFaceImageElementSrc(croppedImage: string): void {
    alert(`${croppedImage}`);

    // console.log(this.cardFaceElementRef.nativeElement.attributes);
    // Need to keep track of what item's being modified

    // FIXME: Why is this not being set
    // console.log('Card face image element index: ', this.currentCardFaceElementId);

    // https://stackoverflow.com/questions/51019467/convert-blob-to-image-url-and-use-in-image-src-to-display-image
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace | null = this.getCardFaceElementPerCardFace(this.currentCardFaceElementsPerCardFace, this.currentCardFaceElementId);

    if (!cardFaceElementPerCardFace)
      return;

    blobToDataURL(croppedImage).then((base64Image) => {
      cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent = base64Image;

      // console.log("croppedImage:", base64Image); // Check if it starts with "data:image/"

      let updated = this.updateCardFaceElementPerCardFace(this.currentCardFaceElementsPerCardFace, cardFaceElementPerCardFace);
      // console.log("After set card face image element source: ", JSON.stringify(this.currentCardFaceElementsPerCardFace));
    });
  }

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

    // console.log('Image', image);

    return image;
  }

  setRteHtmlContent(htmlContent: string) {
    this.isCurrentPopupMenuOpen = false;

    // https://stackoverflow.com/questions/51019467/convert-blob-to-image-url-and-use-in-image-src-to-display-image
    let currentCardFaceElementPerCardFace: CardFaceElementPerCardFace | null = this.getCardFaceElementPerCardFace(this.currentCardFaceElementsPerCardFace, this.currentCardFaceElementId);

    // console.log(`RTE HTML content: ${htmlContent}, Current element index: ${this.currentCardFaceElementId}, Card face element per card face: ${JSON.stringify(currentCardFaceElementPerCardFace)}`);

    if (!currentCardFaceElementPerCardFace)
      return;

    currentCardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent = htmlContent;

    let hasUpdated: boolean = this.updateCardFaceElementPerCardFace(this.currentCardFaceElementsPerCardFace, currentCardFaceElementPerCardFace);

    // console.log("Set Rte Html Content: ", JSON.stringify(this.currentCardFaceElementsPerCardFace));

    // console.log('Has updated: ', hasUpdated);
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
  // TODO: Instead of using outlets and injectors, we should be using services
  getCurrentPopupMenuComponent(): Type<any> | null {
    switch (this.currentPopupMenu) {
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
        y: event.dropPoint.y - container.top,
        dndPositionId: 0
      };

      // console.log(`Palette drop point: ${event.dropPoint.x}, ${event.dropPoint.y}`);
      // 703, 180

      let out = dndPosition.y < 0 || dndPosition.x < 0 || dndPosition.y > container.height || dndPosition.x > container.width;

      if (out)
        return;

      /*
      event.item.data.y=(event.dropPoint.y-this.off.y*this.scaleY-this.dropZone.nativeElement.getBoundingClientRect().top)
      event.item.data.x=(event.dropPoint.x-this.off.x*this.scaleX-this.dropZone.nativeElement.getBoundingClientRect().left)
      this.changeZIndex(event.item.data)
      */

      if (this.currentCardEditorCardFaceDto === undefined) {
        // console.log(`onCreateDragDropped current card face is undefined`);
        return;
      }

      // console.log("Before adding new component: ", JSON.stringify(this.currentCardFaceElementsPerCardFace));

      // ASSUMPTION: If card already exists, get the last element's ID + 1 for new ID to avoid duplicate IDs with the latest
      let newCardFaceElementPerCardFaceId = (this.cardEditorCardDto.card.cardId <= 0) 
      ? this.currentCardFaceElementsPerCardFace.length
      : this.currentCardFaceElementsPerCardFace[this.currentCardFaceElementsPerCardFace.length - 1].cardFaceElement.cardFaceElementId + 1;

      let cardFaceElementPerCardFace: CardFaceElementPerCardFace = {
        cardFaceElement: {
          cardFaceElementId: newCardFaceElementPerCardFaceId,
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

      // TODO: When saving, convert the dndPosition to be something that's savable and percentage based
      // TODO: Make a new cardFaceElementDto, not cardFaceElement
      switch (event.item.data) {
        case 'rte':
          cardFaceElementPerCardFace = {
            cardFaceElement: {
              cardFaceElementId: newCardFaceElementPerCardFaceId, // TODO: Replace with this.currentCardEditorCardFaceDto.cardFaceElementPerCardFaces.length + 1
              cardFaceElementContent: '',
              cardFaceElementType: 'rte',
              style: {
                styleId: 0,
                width: 'fit-content', // Modify
                height: 'fit-content', //Modify
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
              cardFaceElementId: newCardFaceElementPerCardFaceId, 
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

      // Adds in correct order
      this.currentCardFaceElementsPerCardFace.push(cardFaceElementPerCardFace);
      // console.log("Added new component: ", JSON.stringify(this.currentCardFaceElementsPerCardFace));
    }
  }

  // TODO: Actually determine whether you should be able to have more than two sides to a card, then use this to loop through and actually add them
  // That means modifying it so that you don't forkJoin from the flattenCardFaceImage function but rather the uploading files function, map through those, create observables
  // Take an image everytime you flip the card and assign it to this
  cardFaceImages: FormData[] = [

  ];

  // TODO: Make a function to loop through all the card faces, then add the card faces images to that

 // TODO: Use from to convert promise to observable, then chain it using pipe to use with uploading files
  flattenCardFaceToImage(/*cardFace: CardFace | Partial<CardFace>*/): Promise<FormData> {
    return new Promise((resolve, reject) => {
      // TODO: Pass in the ref and scale as parameters
      html2canvas(this.cardEditorFaceRef.nativeElement, {
        scale: 0.45
      })
        .then((canvas: any) => {
          canvas.toBlob((blob: Blob | null) => {
            if (!blob /*|| cardFace === undefined || cardFace?.cardFaceThumbnailFilePath === undefined*/) {
              reject(new Error('Canvas blob is null'));
              return;
            }

            let formData = new FormData();

            // let compatibleCrypto = getCrypto();

            // TODO: Replace the card face ID in the backend, replace via matching Regex of anything less than 1
            // let cardFaceFileName: string = `${cardFace.cardFaceId}-${compatibleCrypto.randomUUID()}.jpg`;

            formData.append('formFile', blob);
            // console.log(cardFaceFileName);
            // console.log(`Form data: ${JSON.stringify(formData.values)}`);

            resolve(formData);
          }, 'image/jpg', 0.8);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  uploadCardFaceElementsImagesAndUpdatePaths$(cardFaceElementsPerFace: CardFaceElementPerCardFace[]): Observable<CardEditorCardDto> {
    if (cardFaceElementsPerFace.length <=0) {
      return of(this.cardEditorCardDto);
    }

    // Question is is this mutable, or is there something going on with the asynchronous
    // FIXME: Why is this out of order?
    let imageElementIndexes: number[] = cardFaceElementsPerFace
      .map((el: CardFaceElementPerCardFace, idx: number) =>
        el.cardFaceElement.cardFaceElementType === 'image' ? idx : -1
      )
      .filter(idx => idx !== -1);

    // Create array preserving original indexes
    let imageElementsWithIndexes = imageElementIndexes.map(idx => ({
      element: cardFaceElementsPerFace[idx],
     originalCardFaceElementId: cardFaceElementsPerFace[idx].cardFaceElement.cardFaceElementId
    }));

    // Sort by ID while keeping original indexes
    imageElementsWithIndexes.sort((a, b) =>
      a.element.cardFaceElement.cardFaceElementId -
      b.element.cardFaceElement.cardFaceElementId
    );

    // Extract sorted elements for upload
    let sortedImageElements = imageElementsWithIndexes.map(x => x.element);
    let cardFaceElementsImages$ = this.uploadCardFaceElementsImages$(sortedImageElements);

    if (cardFaceElementsImages$) {
      return forkJoin(cardFaceElementsImages$).pipe(
        tap((cardFaceElementsImages: { id: string | undefined }[]) => {
          cardFaceElementsImages.forEach((dto, uploadIdx) => {
            if (dto.id) {
              // Use the preserved original index from sorted array
              let originalId= imageElementsWithIndexes[uploadIdx].originalCardFaceElementId;
              
              this.updateCardFaceElementsImagesFilePath(
                cardFaceElementsPerFace,
                originalId,
                dto.id
              );
            }
          });
        }),
        map(() => this.cardEditorCardDto),
        catchError((err) => {
          console.error('Error uploading card face element images:', err);
          return of(this.cardEditorCardDto);
        })
      );
    }
  
    console.warn('No cardFaceElementsImages to upload');
    return of(this.cardEditorCardDto); // safer than null
  }
  
  // FIXME: This isn't ever going to actually update the correct images because cardFaceElementsPerFace have more elements than what's being passed in.
  updateCardFaceElementsImagesFilePath(cardFaceElementsPerFace: CardFaceElementPerCardFace[], originalCardFaceElementId: number, filePath: string) {
    // console.log(`Update card face elements images file path: ${JSON.stringify(cardFaceElementsPerFace)}`);
    
    let targetElement = cardFaceElementsPerFace.find(element => 
      element.cardFaceElement.cardFaceElementId === originalCardFaceElementId
    );
  
    // Update if found and is image type
    if (targetElement && targetElement.cardFaceElement.cardFaceElementType === 'image') {
      targetElement.cardFaceElement.cardFaceElementContent = filePath;
    }
  }
  
  uploadCardFaceElementsImages$(cardFaceElementsPerFace: CardFaceElementPerCardFace[]): Observable<{
    id: string | undefined;
  }>[] | undefined {
    let cardFaceElementsImages$: Observable<{
      id: string | undefined;
    }>[] = [];
  
    if (cardFaceElementsPerFace === undefined)
      return;
    
    cardFaceElementsPerFace.forEach((dto)=> {
      cardFaceElementsImages$.push(this.uploadCardFaceElementImage$(dto as CardFaceElementPerCardFace));
    });
  
    // console.log(`Added to cardFaceElementsImages$`);
  
    return cardFaceElementsImages$;
  }
  // TODO:
  // https://stackoverflow.com/questions/35676451/observable-forkjoin-and-array-argument
  // Upload the card face elements image files in parallel
  uploadCardFaceElementImage$(cardFaceElementPerCardFace: CardFaceElementPerCardFace): Observable<{
    id: string | undefined;
  }> {
    if (cardFaceElementPerCardFace.cardFaceElement.cardFaceElementType !== 'image')
      return of({ id: undefined });

    // CHECKME: Is this correct?
    let content: string = cardFaceElementPerCardFace.cardFaceElement.cardFaceElementContent;

    // let dataUrl: string = cardFaceElementPerCardFace.cardFaceElement?.cardFaceElementContent.replace(/^data:image\/\w+;base64,/, '');

    // https://stackoverflow.com/questions/11876175/how-to-get-a-file-or-blob-from-an-object-url
    // let blob = await fetch(url).then(r => r.blob());
    // Handle blob: URL

    // TODO: Have a message showing that the element image faces are too big and don't create if that's the case
    if (content.startsWith('blob:') || content.endsWith('.png')) {
      return from(fetch(content).then(res => res.blob())).pipe(
        switchMap(blob => {
          let formData = new FormData();
          formData.append('formFile', blob);

          // console.log(`Card face element image blob: ${blob.text()}`);

          return this.fileUploadApiService.uploadFile(formData, 'card-face-element-image');
        })
      );
    }

    // Handle data: URL (base64)
    if (content.startsWith('data:image/')) {
      let base64 = content.replace(/^data:image\/\w+;base64,/, '');
      let byteString = atob(base64);
      let arrayBuffer = new ArrayBuffer(byteString.length);
      let intArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }

      let blob = new Blob([intArray], { type: 'image/png' });
      let formData = new FormData();
      formData.append('formFile', blob);

      // console.log(`Card face element image data url: ${blob.text()}`);
      return this.fileUploadApiService.uploadFile(formData, 'card-face-element-image');
    }

    return of({ id: undefined });
  }

  // When flipping and taking card face image, store that index somehow to actually assign the CardFormData at the correct image

  updateCardFacesThumbnailImages$(): Observable<CardEditorCardDto> {
    // Wrap the promise in an observable if needed
    // TODO: We eventually want to actually use this to have more than 2 faces
    
    let uploadCardFaceImages$ = this.cardFaceImages.map(formData =>
      this.fileUploadApiService.uploadFile(formData, 'card-face')
    );

    // TODO: Replace the fork join with cardFacesFormData
    return forkJoin(uploadCardFaceImages$).pipe(
      tap((results: { id: string }[]) => {
        // Map each result to the corresponding DTO
        results.forEach((result, index) => {
          this.cardEditorCardDto.cardEditorCardFacesDto[index].cardFace.cardFaceThumbnailFilePath =
            result.id;
        });
      }),
      map(() => this.cardEditorCardDto)
    );

    // https://rxjs.dev/api/operators/tap
  }

  // Upload the card face thumbnail images files in parallel
  // Grab the results of those, update the various corresponding elements
  // Create the card after update those

  // CHECKME: Does this actually work
  // https://stackoverflow.com/questions/49698640/flatmap-mergemap-switchmap-and-concatmap-in-rxjs
  createCard(): void {
    if (this.currentCardEditorCardFaceDto !== undefined) {
      // ASSUMPTION: Always gotta have front face's image, and we might never flip
      // FIXME: Problem is the below isn't going to run if there's no card face images
      // this.updateCardFaceImages$(0);
      
      // TODO: Try to make the this.uploadCardFaceElementsImagesAndUpdatePaths$ functions run simultaneously
      // Order of operations:
      // 1. this.updateCardFacesThumbnailImages$
      // 2. this.uploadCardFaceElementsImagesAndUpdatePaths$
      // 3. this.cardApiService.createCardEditorCardDto$(this.cardEditorCardDto) (waits for the other two to finish)
      
      // https://blog.angular-university.io/rxjs-higher-order-mapping/
      this.updateCardFacesThumbnailImages$()
        .pipe(
          mergeMap((cardEditorCardDto: CardEditorCardDto) => this.uploadCardFaceElementsImagesAndUpdatePaths$(cardEditorCardDto.cardEditorCardFacesDto[0].cardFaceElementsPerCardFace)), 
          mergeMap((cardEditorCardDto: CardEditorCardDto) => this.uploadCardFaceElementsImagesAndUpdatePaths$(cardEditorCardDto.cardEditorCardFacesDto[1].cardFaceElementsPerCardFace)), 
          concatMap((cardEditorCardDto: CardEditorCardDto) => this.cardApiService.createCardEditorCardDto$(cardEditorCardDto)), // FIXME: Why doesn't this finish, got it, need to return an actual value
        )
        .subscribe({
          next: (createResult: CardEditorCardDto | Card | undefined) => {
            // console.log('Card successfully created:', createResult);
            
            if (isCardEditorCardDto(createResult)) {
              this.cardEditorCardDto = createResult;
              this.setOnCardFaceModifyBtnText();

              this.setCurrentCardEditorCardFaceDto();
              this.setCurrentCardFaceElementsPerCardFace();

              // TODO: Temporary, there needs to be a check for whether the card's in a room or not, if not in a room then add to the cards collection? 
              // ASSUMPTION: You can only create a card as a user,, or save a new card from a card in the room for that user
              this.cardGameCoreService.onCreateCardEditorCardDto(this.cardEditorCardDto);
            }
          },
          error: (err) => {
            console.error('Something went wrong:', err);
          }
        }
      );
    }
  }

  // TODO: Don't use this
  getCardFaceElementsFileAndUpdateImageSrc$(): Observable<void> {
    // Collect all image fetch observables
    let observables$: Observable<any>[] = [];
  
    this.cardEditorCardDto.cardEditorCardFacesDto.forEach((cfd: CardEditorCardFaceDto) => {
      cfd.cardFaceElementsPerCardFace.forEach((cfe: CardFaceElementPerCardFace) => {
        if (cfe.cardFaceElement.cardFaceElementType === "image") {
          // console.log(`Card face element file and update image source: ${JSON.stringify(cfe.cardFaceElement)}`);
          
          let obs = this.fileUploadApiService.getFile(cfe.cardFaceElement.cardFaceElementContent, 'card-face-element-image').pipe(
            tap((result: Blob | undefined) => {
              // console.log(`Image src URL before update image src: ${cfe.cardFaceElement.cardFaceElementContent}`);

              let objectUrl = URL.createObjectURL(result as Blob);
              cfe.cardFaceElement.cardFaceElementContent = objectUrl;
              
              /*setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
                // console.log('Blob URL revoked');
              }, 30);*/
            })
          );
          observables$.push(obs);
        }
      });
    });
  
    // Wait for all image fetches to complete
    return forkJoin(observables$).pipe(map(() => {}));
  }

    // https://stackblitz.com/edit/angular-html2canvas-example-xfgxcv?file=src%2Fapp%2Fapp.component.ts
        // https://prasanthj.com/javascript/convet-div-to-image-in-angular/
        // https://stackblitz.com/edit/angular-html2canvas-example?file=src%2Fapp%2Fapp.component.ts

        // https://stackoverflow.com/questions/9664474/convert-blob-string-to-jpg-file/9664621
        
        // TODO: Upload the file in the backend, then replacing the cardFaceThumbnailFilePath to that file path

        // document.body.appendChild(canvas);

  // https://stackoverflow.com/questions/76188415/vue3-vite-module-has-been-externalized
}
