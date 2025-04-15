import { Component, computed, effect, inject, input, InputSignal, Signal } from '@angular/core';

import { CardFace } from '../../models/card-face';

import { CardFaceElement, CardFaceElementDto } from '../../models/card-face-element';
import { convertToRelativeCoordinates } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { CardFaceElementApiService } from '../../services/card-face-element-api.service';
import { CardFaceElementComponent } from '../card-face-element/card-face-element.component';
import { parseCssDimensionToNumber } from '../../../style/utils/parse-css-dimensions.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { isCardFaceElementDto } from '../../utils/card-game-core.utils';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

// https://medium.com/@niteshdaga000/optimizing-performance-with-memory-caching-in-angular-applications-dad3efeb1f99
// TODO: When loading in the cards menu, use a hybdrid approach of storing the indices, caching the images in memory, using LRU, and only replacing the images that have changed via checking timestamp
@Component({
  selector: 'app-card-face',
  imports: [CardFaceElementComponent, CommonModule],
  templateUrl: './card-face.component.html',
  styleUrl: './card-face.component.css'
})
export class CardFaceComponent {
  private readonly fileUploadApiService = inject(FileUploadApiService);

  // TODO: Have the calculation to convert the card face elements here
  cardFaceInput: InputSignal<CardFace | undefined>=  input<CardFace | undefined>({
    cardFaceId: 0,
    style: {
      styleId: 0,
      width: '0px',
      height: '0px'
    }
  });
  readonly cardFaceComputed: Signal<CardFace | undefined> = computed(() => this.cardFaceInput());

  cardFace: CardFace = {
    cardFaceId: 0,
    style: {
      styleId: 0
    }
  }

  // TODO: Card face image here
  // https://stackoverflow.com/a/27197907
  cardFaceImageSrc: string = '';

  private destroy$ = new Subject<void>();

  image: HTMLImageElement | undefined;

  getCardFaceImageSrc(): Promise<HTMLImageElement | undefined> {
    if (!this.cardFace.cardFaceThumbnailFilePath) {
      return Promise.resolve(undefined);
    }

    // https://www.learnrxjs.io/learn-rxjs/operators/filtering/takeuntil
    return new Promise((resolve) => {
      this.fileUploadApiService.getFile(
        this.cardFace.cardFaceThumbnailFilePath as string,
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
            console.log('Image loaded:', image.naturalWidth, image.naturalHeight);
            resolve(image); // Resolve first then release because it has to be rendered first
            
            // Need to revoke the object URL after, make sure the blob is already rendered beforehand
            setTimeout(() => {
              URL.revokeObjectURL(objectUrl);
              console.log('Blob URL revoked');
            }, 30); // Use setTimeout to ensure revocation happens after rendering
          }
  
          image.onerror = () => {
            console.log(`Image on error`);
            URL.revokeObjectURL(objectUrl); // Release on error
            resolve(undefined);
          };
        },
        error: (err: any) => {
          console.log(`Error: ${JSON.stringify(err)}`);
          resolve(undefined) // Handle API errors
        }
      });
    });
  }

  constructor() {
    effect(() => {
      let cardFace = this.cardFaceComputed();
      
      if (cardFace !== undefined && cardFace.cardFaceId !== 0) {
        this.cardFace = cardFace;

        this.getCardFaceImageSrc().then((image: HTMLImageElement | undefined) => {
          this.image = image;
        })
      }
    });
  }
}
