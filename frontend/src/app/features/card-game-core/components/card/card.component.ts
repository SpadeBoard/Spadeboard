import { Component, computed, effect, inject, input, InputSignal, model, ModelSignal, Signal, ViewChild } from '@angular/core';

import { Card } from '../../models/card';

import { CommonModule } from '@angular/common';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { CardFace } from '../../models/card-face';
import { CardFacePerCardApiService } from '../../services/card-game-core/api/card-face-per-card-api.service';
import { getDefaultCardEditorCardFaceDimensions } from '../../utils/card-editor.constants';
import { DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC, getDefaultCardFaceImage } from '../../utils/card-face.constants';
import { CardFaceImage } from '../../utils/card-face.utils';
import { CardFaceComponent } from '../card-face/card-face.component';
import { Dimensions } from '../../../../utils/utils';

@Component({
  selector: 'app-card',
  imports: [
    CardFaceComponent,
    CommonModule
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  // animations: [cardFlipAnimation]
})
export class CardComponent {
  private readonly cardFacePerCardApiService: CardFacePerCardApiService = inject(CardFacePerCardApiService);
  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);
  // https://medium.com/@chandrashekharsingh25/angular-signals-explained-with-practical-examples-e45de6d00925
  // Might need computed signals then

  @ViewChild('cardFace') cardFaceRef!: CardFaceComponent;

  card: ModelSignal<Card> =model<Card >({
    cardId: "0",
    currentCardFaceIndex: 0,
    cardName: ''
  });

  // TODO: Figure out the alternate text for images
  cardFaceImages: Map<number, CardFaceImage> = new Map<number, CardFaceImage>();

  cardScale: InputSignal<number> =  input<number>(1);
  cardScaleComputed: Signal<number>  = computed(() => this.cardScale());

  constructor() {
    effect(() => {
      // https://builtin.com/software-engineering-perspectives/forkjoin
      if (this.card()) {
        this.loadCardFaces(this.card());
      }
    });
  }

  // TODO: Grab the dimensions of the first card face, always, check and see if there's a dimension associated with it
  private defaultCardFaceDimensions: Dimensions = getDefaultCardEditorCardFaceDimensions();

  private setDefaultDimensionsFromFrontFace(): void {
    // NOTE: The reason why we do this is so let's say we have no back face, the blank placeholder will still maintain the same dimensions as the face that has dimensions
    // ASSUMPTION: First face will always have an image due to the canvas taking an image of it on creation/update
    // FIXME: Why is this not working
    let image: CardFaceImage | undefined = this.cardFaceImages.get(0);
    
    if (!image) return;

    this.defaultCardFaceDimensions = image.dimensions;
  }

  getCurrentCardFaceImage(): CardFaceImage {
    let currentCardFaceIndex: number = this.card().currentCardFaceIndex;

    // NOTE: The reason is because we currently pass in the card scale as the DEFAULT_CARD_SCALE
    // CHECKME: Make sure we actually want to do this and potentially modify it to be more easy to manage in the future
    if (!this.cardFaceImages.has(currentCardFaceIndex)) {
      return getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, this.defaultCardFaceDimensions);
    }

    return this.cardFaceImages.get(currentCardFaceIndex)!;
  }

  // TODO: Rework this, use cardApiService to get the card face IDs, then use a switch map, pass it into the next then assign the cardFaces
  private loadCardFaces(card: Card): void {
    this.cardFacePerCardApiService.getCardFacesPerCard$(card.cardId).subscribe((result: CardFace[] | undefined) => {
      if (!result)
        return;

      console.log(`Load card faces: ${JSON.stringify(result, null, 2)}`);

      result.map((cardFace: CardFace, idx: number) => {
        console.log(`Thumbnail File Metadata: ${JSON.stringify(cardFace.cardFaceThumbnailFileMetadata, null, 2)}`);

        this.getCardFaceImageSrc(cardFace).then((image: HTMLImageElement | undefined) => {
          if (!image) {
            console.warn(`No image associated with ${cardFace.cardFaceId}`);
            
            this.cardFaceImages.set(idx, getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, this.defaultCardFaceDimensions));
            return;
          }

          this.cardFaceImages.set(idx, {
            src: image.src,
            alt: image.alt,
            dimensions: {
              width: image.width,
              height: image.height
            }
          });
        })
      })
    });
  }

  private getCardFaceImageSrc(cardFace: CardFace): Promise<HTMLImageElement | undefined> {
    if (!cardFace.cardFaceThumbnailFileMetadata) {
      console.warn(`ID: ${cardFace.cardFaceId}, No card face thumbnail file metadata`);
      return Promise.resolve(undefined);
    }

    // https://www.learnrxjs.io/learn-rxjs/operators/filtering/takeuntil
    return new Promise((resolve) => {
      this.fileUploadApiService.getFile$(
        cardFace.cardFaceThumbnailFileMetadata?.fileName as string,
        'card-face'
      ).pipe(
        // takeUntil(this.destroy$) // Call on ngDestroy, prevents memory leaks
      ).subscribe({
        next: (result: Blob | undefined) => {
          if (!result) {
            console.warn(`Get file metadata: ID - ${cardFace.cardFaceId}, No card face thumbnail file metadata`);
            resolve(undefined);
            return;
          }
  
          let image = new Image();
          let objectUrl = URL.createObjectURL(result);
          image.src = objectUrl;
          
          image.onload = () => {
            // console.log('Image loaded:', image.naturalWidth, image.naturalHeight);
            resolve(image); // Resolve first then release because it has to be rendered first
          }
  
          image.onerror = () => {
            // console.log(`Image on error`);
            URL.revokeObjectURL(objectUrl); // Release on error
            resolve(undefined);
          };
        },
        error: (err: any) => {
          console.log(`Get file metadata: ID - ${cardFace.cardFaceId}, Error: ${JSON.stringify(err)}`);
          resolve(undefined) // Handle API errors
        }
      });
    });
  }

  onRevokeSrc(url: string) {
    console.log(`Url to revoke: ${url}`);

    if (!url.startsWith('blob:')) {
      console.warn("Should be a blob we're revoking");
      return;
    }

    URL.revokeObjectURL(url);
    // console.log('Blob URL revoked after image loaded');
  }

  ngOnDestroy() {
    // Image not loading on flipped card, problem is it's being destroyed as the card's being flipped, so it's not present in the DOM to be taken images of
    // TODO: Actually call the revoke source somehow
    // This is literally just a workaround and not gonna work
    this.cardFaceImages.forEach((value: CardFaceImage, key: number) => {
      if (!value || !value.src)
        throw new Error("Card face image doesn't have a url");
      
      if (value.src !== '' && value.src !== DEFAULT_CARD_FACE_PLACEHOLDER_SRC) this.onRevokeSrc(value.src);
    })
  }
}
