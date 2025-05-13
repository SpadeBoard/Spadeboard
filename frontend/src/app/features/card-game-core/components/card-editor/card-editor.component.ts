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
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { catchError, concatMap, EMPTY, forkJoin, from, map, mergeMap, Observable, ObservedValueOf, of, pipe, switchMap, tap } from 'rxjs';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { CardEditorPreviewComponent } from '../card-editor-preview/card-editor-preview.component';
import { CardEditorControlsDesignComponent } from '../card-editor-controls-design/card-editor-controls-design.component';
import { CardEditorControlsDesignImageService } from '../../services/card-editor-controls-design-image.service';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { CardEditorCloseComponent } from '../card-editor-close/card-editor-close.component';

// TODO: Resizable card face, have arrows for dragging, make sure there's a max width/height for that card face
@Component({
  selector: 'app-card-editor',
  imports: [
    AngularEditorModule, FormsModule,
    CommonModule, NgComponentOutlet,
    CardFaceRteComponent, CardFaceImageComponent,
    CardEditorPreviewComponent, CardEditorControlsDesignComponent,
    CardEditorCloseComponent
  ], // TODO: Remove CdkDrag
  templateUrl: './card-editor.component.html',
  styleUrl: './card-editor.component.css'
})
export class CardEditorComponent implements AfterViewInit {
  // https://www.youtube.com/watch?v=5JcMras7aaA
  private readonly cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private readonly cardApiService: CardApiService = inject(CardApiService);

  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);

  private currentCardFaceElementId: string = "-1";

  constructor() {
    effect(() => {
      if (parseFloat(this.cardGameCoreService.cardEditorCardDto().card.cardId) !== undefined && parseFloat(this.cardGameCoreService.cardEditorCardDto().card.cardId) as number > 0) {
        this.setCardEditorCardDto(this.cardGameCoreService.cardEditorCardDto());
      }
    });

    this.setCurrentCardEditorCardFaceDto();
    this.setCurrentCardFaceElementsPerCardFace();

    this.onEnableImageEditor();
    this.onDisableImageEditor();
  }

  ngAfterViewInit(): void {

  }

  setCardEditorCardDto(newCardEditorCardDto: CardEditorCardDto) {
    if (!newCardEditorCardDto || parseFloat(newCardEditorCardDto.card.cardId) === undefined || parseFloat(newCardEditorCardDto.card.cardId) < 0) return;
      this.cardEditorCardDto = newCardEditorCardDto;
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
        styleId: "0",
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
  /*popupMenuInjector: Injector = Injector.create({
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
  });*/

  // ASSUMPTIONS
  // Empty card faces have already been made and will be used to assign to currentCardEditorCardFaceDto
  // Card face probably has an associated dimension with it
  currentCardEditorCardFaceDto: CardEditorCardFaceDto= {
    cardFace: {
      cardFaceId: "0",
      style: {
        styleId: "0"
      }
    },
    cardFaceElementsPerCardFace: []
  };

  cardEditorCardDto: CardEditorCardDto = {
    card: {
      cardId: "0",
      currentCardFaceIndex: 0,
      cardName: '',
      isTemplate: false
    },
    ownerId: '5811e387-1551-4090-9485-a3ebe30efb5a',
    cardEditorCardFacesDto: [
      {
        cardFace: {
          cardFaceId: "0",
          style: {
            styleId: "0",
            width: '100', // Modify
            height: '100', //Modify
            zIndex: 'inherit',
            border: '2px dotted rgb(204, 204, 204)'
          },
          cardFaceThumbnailFilePath: ''
        },
        cardFaceElementsPerCardFace: [
        ]
      },
      {
        cardFace: {
          cardFaceId: "-1",
          style: {
            styleId: "0",
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

  // initialPosition: DndPosition = {x: 0, y: 0};

  currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[] = [

  ];

  setCurrentCardFaceElementsPerCardFace(): void {
    this.currentCardFaceElementsPerCardFace = this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace;
    
    // console.log(`Set current card face elements per card face: ${JSON.stringify(this.currentCardFaceElementsPerCardFace)}`);
  }

  position: DndPosition = {
    x: 0, y: 0,
    dndPositionId: "0"
  };

  // TODO: Use ngx-color-picker for picking colors on the card face

  private currentPopupMenu: number | null = 0;


  getCardFaceElementPerCardFace(cardFaceElementsPerCardFace: CardFaceElementPerCardFace[], cardFaceElementId: string): CardFaceElementPerCardFace | null {
    let cardFaceElementPerCardFace: CardFaceElementPerCardFace = {
      cardFaceElement: {
        cardFaceElementId: "0",
        cardFaceElementContent: '',
        style: {
          styleId: "0"
        }
      },
      dndItem: {
        dndItemId: "0",
        isDraggable: false,
        isDroppable: false
      },
      dndPosition: {
        x: 0,
        y: 0,
        dndPositionId: "0"
      },
      cardFaceElementPerCardFaceId: "0"
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

  // TODO: Modify this for if there's more than 2 card faces
  setCurrentCardEditorCardFaceDto(): void {
    this.currentCardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.cardEditorCardDto.card.currentCardFaceIndex];
  
    // console.log(`Set current card editor card face DTO: ${JSON.stringify(this.currentCardEditorCardFaceDto)}`);
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

  onEnableImageEditor() {
    this.cardEditorControlsDesignImageService.onEnableImageEditor$.subscribe(() => {
      this.currentPopupMenu = 0;
      this.isCurrentPopupMenuOpen = true;
    })
  }

  onDisableImageEditor() {
    this.cardEditorControlsDesignImageService.onDisableImageEditor$.subscribe((src: string) => {
      this.isCurrentPopupMenuOpen = false;
    })
  }


  // TODO: Actually determine whether you should be able to have more than two sides to a card, then use this to loop through and actually add them
  // That means modifying it so that you don't forkJoin from the flattenCardFaceImage function but rather the uploading files function, map through those, create observables
  // Take an image everytime you flip the card and assign it to this
  // TODO: Make a function to loop through all the card faces, then add the card faces images to that

 // TODO: Use from to convert promise to observable, then chain it using pipe to use with uploading files
  

  // Upload the card face thumbnail images files in parallel
  // Grab the results of those, update the various corresponding elements
  // Create the card after update those

    // https://stackblitz.com/edit/angular-html2canvas-example-xfgxcv?file=src%2Fapp%2Fapp.component.ts
        // https://prasanthj.com/javascript/convet-div-to-image-in-angular/
        // https://stackblitz.com/edit/angular-html2canvas-example?file=src%2Fapp%2Fapp.component.ts

        // https://stackoverflow.com/questions/9664474/convert-blob-string-to-jpg-file/9664621
        
        // TODO: Upload the file in the backend, then replacing the cardFaceThumbnailFilePath to that file path

        // document.body.appendChild(canvas);

  // https://stackoverflow.com/questions/76188415/vue3-vite-module-has-been-externalized
}
