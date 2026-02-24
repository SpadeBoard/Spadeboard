import { inject, Injectable } from '@angular/core';
import { FileUploadApiService } from '../../../../../utils/services/file/upload/api/file-upload-api.service';
import { Dimensions, unzipImages } from '../../../../../utils/utils';
import { Card } from '../../../card/models/card';
import { CardFace } from '../../../card-face/models/card-face';
import { DEFAULT_CARD_FACE_PLACEHOLDER_ALT, DEFAULT_CARD_FACE_PLACEHOLDER_SRC, getDefaultCardFaceImage } from '../../../card-face/constants/card-face.constants';
import { CardFaceImage } from '../../../card-face/utils/card-face.utils';
import { CardFacePerCardApiService } from '../../../services/card-game-core/api/card-face-per-card-api.service';
import { CardFacePerLodApiService } from '../../../card-face-per-lod/services/api/card-face-per-lod-api.service';
import { CardApiService } from '../api/card-api.service';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly cardApiService: CardApiService = inject<CardApiService>(CardApiService);

  private readonly cardFacePerCardApiService: CardFacePerCardApiService = inject<CardFacePerCardApiService>(CardFacePerCardApiService);

  private readonly cardFacePerLodApiService: CardFacePerLodApiService = inject<CardFacePerLodApiService>(CardFacePerLodApiService);

  private readonly fileUploadApiService: FileUploadApiService = inject<FileUploadApiService>(FileUploadApiService);
  
  constructor() { }

  public getCards(userId: string, cards: Card[]): void {
    this.cardApiService.getCards$(userId).subscribe((result: Card[] | undefined) => {
      if (result) cards.splice(0, cards.length, ...result);
    });
  }

  public getCurrentCardFaceImage(currentCardFaceId: string, cardFaceIdImagesPairs: Map<string, CardFaceImage[]>, currentLod: number, cardFaceDimensions: Dimensions): CardFaceImage {
    let cardFaceImages: CardFaceImage[] | undefined = cardFaceIdImagesPairs.get(currentCardFaceId);

    if (!cardFaceImages || cardFaceImages.length <= 0) return getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, cardFaceDimensions);

    // NOTE: The reason is because we currently pass in the card scale as the DEFAULT_CARD_SCALE
    // CHECKME: Make sure we actually want to do this and potentially modify it to be more easy to manage in the future
    let lod: CardFaceImage | undefined = cardFaceImages[currentLod];

    if (!lod) return getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, cardFaceDimensions);

    return lod;
  }

  // TODO: Sort the card faces per lod in the backend?
  // Just return the file names
  public async getCardFaceLodsSrcs(fileNames: string[]): Promise<HTMLImageElement[] | undefined> {
    return new Promise((resolve) => {
      this.fileUploadApiService.getFiles$(fileNames, 'card-face').subscribe({
        next: async (result: Blob | undefined) => {
          if (!result) {
            console.warn(`No card face thumbnail file metadata`);
            resolve(undefined);
            return;
          }

          resolve(unzipImages(result));
        },
        error: (err) => {
          console.log(`Get files metadata, Error: ${JSON.stringify(err)}`);
          resolve(undefined);
        }
      });
    });
  }


  public getCardFaceImageSrc(fileName: string): Promise<HTMLImageElement | undefined> {
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

  public loadCardFaces(card: Card, cardFaceIdImagesPairs: Map<string, CardFaceImage[]>, defaultCardFaceDimensions: Dimensions): void {
    this.cardFacePerCardApiService.getCardFacesPerCard$(card.cardId).subscribe((result: CardFace[] | undefined) => {
      if (!result)
        return;

      // console.log(`Load card faces: ${JSON.stringify(result, null, 2)}`);

      result.map((cardFace: CardFace) => {
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

                cardFaceIdImagesPairs.set(
                  cardFace.cardFaceId, [
                  getDefaultCardFaceImage(DEFAULT_CARD_FACE_PLACEHOLDER_SRC, DEFAULT_CARD_FACE_PLACEHOLDER_ALT, defaultCardFaceDimensions)
                ]);

                return;
              }

              cardFaceIdImagesPairs.set(cardFace.cardFaceId, images.map((image: HTMLImageElement) => {
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

  // TODO: Figure out how to use this?
  public setDefaultDimensionsFromFrontFace(cardFaceIdImagesPairs: Map<string, CardFaceImage[]>, defaultCardFaceDimensions: Dimensions): void {
    // NOTE: The reason why we do this is so let's say we have no back face, the blank placeholder will still maintain the same dimensions as the face that has dimensions
    // ASSUMPTION: First face will always have an image due to the canvas taking an image of it on creation/update
    // FIXME: Why is this not working
    let key: string = Array.from(cardFaceIdImagesPairs.keys())[0];
    let cardFaceImages: CardFaceImage[] | undefined = cardFaceIdImagesPairs.get(key);

    if (!cardFaceImages || cardFaceImages.length <= 0) throw new Error("Card should at least have front face");

    let image: CardFaceImage | undefined = cardFaceImages[0];

    if (!image) return;

    defaultCardFaceDimensions = image.dimensions;
  }
}