import { afterRenderEffect, Component, computed, DestroyRef, effect, inject, Input, input, InputSignal, Signal } from '@angular/core';

import { CardFace } from '../../models/card-face';

import { CardFaceElement, CardFaceElementDto } from '../../models/card-face-element';
import { convertToRelativeCoordinates } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { CardFaceElementApiService } from '../../services/card-game-core/card-face-element-api.service';
import { parseCssDimensionToNumber } from '../../../style/utils/parse-css-dimensions.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { isCardFaceElementDto } from '../../utils/card-game-core.utils';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FileMetadataApiService } from '../../../../utils/services/file-metadata-api.service';
import { FileMetadataStatus } from '../../../../utils/models/file-metadata';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { getScaledItemRenderDimensions } from '../../../../utils/utils';

// https://medium.com/@niteshdaga000/optimizing-performance-with-memory-caching-in-angular-applications-dad3efeb1f99
// TODO: When loading in the cards menu, use a hybdrid approach of storing the indices, caching the images in memory, using LRU, and only replacing the images that have changed via checking timestamp
@Component({
  selector: 'app-card-face',
  imports: [CommonModule],
  templateUrl: './card-face.component.html',
  styleUrl: './card-face.component.css'
})
export class CardFaceComponent {
  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);
 
  // TODO: Have the calculation to convert the card face elements here
  cardFaceInput: InputSignal<CardFace | undefined>=  input<CardFace | undefined>({
    cardFaceId: "0",
    style: {
      styleId: "0",
      width: '0px',
      height: '0px'
    },
    cardFaceThumbnailFileMetadata: {
      fileMetadataId: '',
      volumePath: '',
      fileName: '',
      fileMetadataStatus: FileMetadataStatus.Pending,
      creationDate: null
    }
  });

  cardFaceScale: InputSignal<number> = input<number>(1);

  // TODO: Card face image here
  // https://stackoverflow.com/a/27197907
  private destroyRef: DestroyRef = inject(DestroyRef);

  DEFAULT_BASE_WIDTH: number = 154;
  DEFAULT_BASE_HEIGHT: number = 215;

  baseDimensions = {
    width: this.DEFAULT_BASE_WIDTH,
    height: this.DEFAULT_BASE_HEIGHT
  }

  image= {
    src: '/blank-card-canvas.svg',
    alt: 'Placeholder card face',
    width: this.baseDimensions.width,
    height: this.baseDimensions.height
  };

  // TODO: Refactor this, this should not be here?
  // To be used on DND Board, but should just be general in case?
  // Here's the problem, if you just use transform scale here, the interactive area's not going to resize, which is going to cause issues with UX
  setCardFaceImageDimensions(scale: number) {
    let scaledDimensions: {
      scaledWidth: number;
      scaledHeight: number;
    } = getScaledItemRenderDimensions(this.baseDimensions.width, this.baseDimensions.height, scale); // NOTE: Should this even be in this service? It's just a general scaling function

    // FIXED: It was taking the new width and height then multiplying by that instead. Compounded scaling.
    this.image.width = scaledDimensions.scaledWidth;
    this.image.height = scaledDimensions.scaledHeight;
  }

  getCardFaceImageSrc(cardFace: CardFace): Promise<HTMLImageElement | undefined> {
    if (!cardFace.cardFaceThumbnailFileMetadata) {
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
            resolve(undefined);
            return;
          }
  
          let image = new Image();
          let objectUrl = URL.createObjectURL(result);
          image.src = objectUrl;
          
          image.onload = () => {
            // console.log('Image loaded:', image.naturalWidth, image.naturalHeight);
            resolve(image); // Resolve first then release because it has to be rendered first
            
            // Need to revoke the object URL after, make sure the blob is already rendered beforehand
            setTimeout(() => {
              URL.revokeObjectURL(objectUrl);
              // console.log('Blob URL revoked');
            }, 30); // Use setTimeout to ensure revocation happens after rendering
          }
  
          image.onerror = () => {
            // console.log(`Image on error`);
            URL.revokeObjectURL(objectUrl); // Release on error
            resolve(undefined);
          };
        },
        error: (err: any) => {
          // console.log(`Error: ${JSON.stringify(err)}`);
          resolve(undefined) // Handle API errors
        }
      });
    });
  }

  // TODO: How to figure out subscribing to scaling

  constructor() {
    effect(() => {
      let cardFace = this.cardFaceInput();
      
      if (cardFace !== undefined && parseFloat(cardFace.cardFaceId) !== 0) {
        if (!cardFace.cardFaceThumbnailFileMetadata) {
          this.setPlaceholderCardFace();
          return;
        }

        this.getCardFaceImageSrc(cardFace).then((image: HTMLImageElement | undefined) => {
          if (!image) {
            return;
          }

          this.image.src = image.src;
          this.image.alt = image.alt;

          this.setBaseDimensions(image.width, image.height);
        })

        // This is indeed necessary, because we might not even be grabbing the card face,
        // To be frank I can't remember why I wrote this here, shouldn't it just be moved outside of this check?
        // Probably should use guard clausing instead
         if (this.shouldScaleCardFace()) {
           this.setCardFaceImageDimensions(this.cardFaceScale());
         }
      }
    });
  }

  shouldScaleCardFace(): boolean {
    let scale = this.cardFaceScale();
    return scale !== undefined && scale !== null && scale !== 0 && scale !== 1;
  }

  setBaseDimensions(baseDimensionWidth: number, baseDimensionHeight: number) {
    this.baseDimensions.width = baseDimensionWidth;
    this.baseDimensions.height = baseDimensionHeight;
    
    if (this.shouldScaleCardFace()) {
      this.setCardFaceImageDimensions(this.cardFaceScale());
      return;
    }

     this.image.width = this.baseDimensions.width;
     this.image.height = this.baseDimensions.height;
  }

  setPlaceholderCardFace() {
    this.image.src = "/blank-card-canvas.svg";
    this.image.alt = 'Placeholder card face';

    this.setBaseDimensions(this.DEFAULT_BASE_WIDTH, this.DEFAULT_BASE_HEIGHT);
  }
}
