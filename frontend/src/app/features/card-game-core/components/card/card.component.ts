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
import { Dimensions, getLodIndex } from '../../../../utils/utils';
import JSZip from 'jszip';
import { CardFacePerLodApiService } from '../../services/card-game-core/api/card-face-per-lod-api.service';

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
  private readonly cardFacePerLodApiService: CardFacePerLodApiService = inject(CardFacePerLodApiService);

  @ViewChild('cardFace') cardFaceRef!: CardFaceComponent;

  card: ModelSignal<Card> =model<Card >({
    cardId: "0",
    currentCardFaceIndex: 0,
    cardName: ''
  });

  // TODO: Figure out the alternate text for images
  // TODO:
  // 1. Potentially store the file metadata ID OR file name associated with the card face image
  // The reason is so we can check to see if it's already there, so we don't have to load that LOD again.
  cardFaceImages: Map<string, CardFaceImage[]> = new Map<string, CardFaceImage[]>();

  cardScale: InputSignal<number> =  input<number>(1);
  cardScaleComputed: Signal<number>  = computed(() => this.cardScale());

  currentLodComputed: Signal<number> = computed(() => getLodIndex(this.cardScale()));

  constructor() {
    effect(() => {
      // https://builtin.com/software-engineering-perspectives/forkjoin
      // CHECKME: Are there unnecessary reloadings in place causing lag and dimensions calculation errors?
      // It's not reading the card periodically, is triggered by certain actions
      // TODO: We need to figure out how to ONLY load the card faces when the card faces themselves have changed AND when the card model changes
      
      // Potentially also if cardScale changes too
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
    let key: string = Array.from(this.cardFaceImages.keys())[0];
    let cardFaceImages: CardFaceImage[] | undefined = this.cardFaceImages.get(key);

    if (!cardFaceImages || cardFaceImages.length <= 0) throw new Error("Card should at least have front face");

    let image: CardFaceImage | undefined = cardFaceImages[0];
    
    if (!image) return;

    this.defaultCardFaceDimensions = image.dimensions;
  }

  getCurrentCardFaceImage(): CardFaceImage {
    let currentCardFaceIndex: number = this.card().currentCardFaceIndex;
    let key: string = Array.from(this.cardFaceImages.keys())[currentCardFaceIndex];

    let cardFaceImages: CardFaceImage[] | undefined = this.cardFaceImages.get(key);

    if (!cardFaceImages || cardFaceImages.length <= 0) return getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, this.defaultCardFaceDimensions);

    // NOTE: The reason is because we currently pass in the card scale as the DEFAULT_CARD_SCALE
    // CHECKME: Make sure we actually want to do this and potentially modify it to be more easy to manage in the future
    let lod: CardFaceImage | undefined = cardFaceImages[this.currentLodComputed()];

    if (!lod) return getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, this.defaultCardFaceDimensions);

    return lod;
  }

  // TODO: Rework this, use cardApiService to get the card face IDs, then use a switch map, pass it into the next then assign the cardFaces
  private loadCardFaces(card: Card): void {
    this.cardFacePerCardApiService.getCardFacesPerCard$(card.cardId).subscribe((result: CardFace[] | undefined) => {
      if (!result)
        return;

      console.log(`Load card faces: ${JSON.stringify(result, null, 2)}`);

      result.map((cardFace: CardFace, idx: number) => {
        // TODO: Grab the file names, then pass into getCardFaceLodsSrcs
        this.cardFacePerLodApiService.getFileMetadataFileNamesByCardFace$(cardFace.cardFaceId)
          .subscribe((fileMetadataNames: string[] | undefined) => {
            if (!fileMetadataNames || fileMetadataNames.length <= 0) {
                console.warn(`No file metadata associated with card face ${cardFace.cardFaceId}`);
                return;
            }

            // TODO: Check to see if these file metadata file names already exist inside of the cardFaceImages variable
            // If they don't, then load the LODs, else just return

            this.getCardFaceLodsSrcs(fileMetadataNames).then((images: HTMLImageElement[] | undefined) => {
              if (!images) {
                console.warn(`No image associated with ${cardFace.cardFaceId}`);

                this.cardFaceImages.set(cardFace.cardFaceId, [
                  getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, this.defaultCardFaceDimensions)
                ]);

                return;
              }

              this.cardFaceImages.set(cardFace.cardFaceId, images.map((image: HTMLImageElement) => {
                return {
                  src: image.src,
                  alt: image.alt,
                  dimensions: {
                    width: image.width,
                    height: image.height
                  }
                }
              }));
              })
            });
          });
    });
  }
  
  // TODO: Sort the card faces per lod in the backend?
  // Just return the file names

  private async getCardFaceLodsSrcs(fileNames: string[]): Promise<HTMLImageElement[] | undefined> {
    return new Promise((resolve) => {
      this.fileUploadApiService.getFiles$(fileNames, 'card-face').subscribe({
        next: async (result: Blob | undefined) => {
          if (!result) {
            console.warn(`No card face thumbnail file metadata`);
            resolve(undefined);
            return;
          }

          try {
            let zip: JSZip = await JSZip.loadAsync(result);
            let files: JSZip.JSZipObject[] = Object.values(zip.files);

            console.log(`Zip files: ${JSON.stringify(files, null, 2)})`);

            let images: HTMLImageElement[] = [];

            for (let file of files) {
              if (file.dir) {
                throw new Error("Zip contains directories, expected only files");
              }

              let blob: Blob = await file.async("blob");
              let image: HTMLImageElement = new Image();
              let objectUrl: string = URL.createObjectURL(blob);

              // Await image load or error
              await new Promise<void>((imageResolve, imageReject) => {
                image.onload = () => {
                  imageResolve();
                };
                image.onerror = () => {
                  URL.revokeObjectURL(objectUrl);
                  imageReject(new Error(`Failed to load image ${file.name}`));
                };
                image.src = objectUrl;
              });

              images.push(image);
            }

            resolve(images);
          } catch (error) {
            console.error("Error while processing zip file images", error);
            resolve(undefined);
          }
        },
        error: (err) => {
          console.log(`Get files metadata, Error: ${JSON.stringify(err)}`);
          resolve(undefined);
        }
      });
    });
  }


  private getCardFaceImageSrc(fileName: string): Promise<HTMLImageElement | undefined> {
    // https://www.learnrxjs.io/learn-rxjs/operators/filtering/takeuntil
    return new Promise((resolve) => {
      this.fileUploadApiService.getFile$(fileName, 'card-face').pipe(
        // takeUntil(this.destroy$) // Call on ngDestroy, prevents memory leaks
      ).subscribe({
        next: (result: Blob | undefined) => {
          if (!result) {
            console.warn(`Get file metadata: Name - ${fileName}, No card face thumbnail file metadata`);
            resolve(undefined);
            return;
          }
  
          let image: HTMLImageElement = new Image();
          let objectUrl: string = URL.createObjectURL(result);
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
          console.log(`Get file metadata: ID - ${fileName}, Error: ${JSON.stringify(err)}`);
          resolve(undefined)
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
    this.cardFaceImages.forEach((values: CardFaceImage[], key: string) => {
      if (!values)
        throw new Error("Card face image doesn't have a url");

      values.forEach((value: CardFaceImage) => {
        if (value.src !== '' && value.src !== DEFAULT_CARD_FACE_PLACEHOLDER_SRC) this.onRevokeSrc(value.src);
      });
    })
  }
}
