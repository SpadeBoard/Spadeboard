import { Component, computed, effect, inject, input, InputSignal, model, ModelSignal, Signal, ViewChild } from '@angular/core';

import { Card } from '../../models/card';

import { CommonModule } from '@angular/common';
import { CardFace } from '../../models/card-face';
import { CardFaceApiService } from '../../services/card-game-core/api/card-face-api.service';
import { CardFaceComponent } from '../card-face/card-face.component';
import { FileUploadApiService } from '../../../../utils/services/file-upload-api.service';

@Component({
  selector: 'app-card',
  imports: [
    CardFaceComponent,
    CommonModule
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  // animations: [cardFlipAnimation]
})
export class CardComponent {
  private readonly cardFaceApiService: CardFaceApiService = inject(CardFaceApiService);
  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);
  // https://medium.com/@chandrashekharsingh25/angular-signals-explained-with-practical-examples-e45de6d00925
  // Might need computed signals then

  @ViewChild('cardFace') cardFaceRef!: CardFaceComponent;

  card: ModelSignal<Card> =model<Card >({
    cardId: "0",
    currentCardFaceIndex: 0,
    cardName: '',
    isTemplate: false
  });

  // TODO: Figure out the alternate text for images
  cardFaceImageSrcs: Map<number, string> = new Map<number, string>();

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

  getCurrentCardFaceImageSrc(): string {
    let currentCardFaceIndex: number = this.card().currentCardFaceIndex;
    
    if (!this.cardFaceImageSrcs.has(currentCardFaceIndex)) {
      return "";
    }

    return this.cardFaceImageSrcs.get(currentCardFaceIndex)!;
  }

  // TODO: Rework this, use cardApiService to get the card face IDs, then use a switch map, pass it into the next then assign the cardFaces
  private loadCardFaces(card: Card): void {
    this.cardFaceApiService.getCardFacesPerCard$(card.cardId).subscribe((result: CardFace[] | undefined) => {
      if (!result)
        return;

      console.log(`Load card faces: ${JSON.stringify(result, null, 2)}`);

      result.map((cardFace: CardFace, idx: number) => {
        console.log(`Thumbnail File Metadata: ${JSON.stringify(cardFace.cardFaceThumbnailFileMetadata, null, 2)}`);

        this.getCardFaceImageSrc(cardFace).then((image: HTMLImageElement | undefined) => {
          if (!image) {
            console.warn(`No image associated with ${cardFace.cardFaceId}`);
            this.cardFaceImageSrcs.set(idx, "");
            return;
          }

          this.cardFaceImageSrcs.set(idx, image.src);
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
    if (!url.startsWith('blob:'))
      throw new Error("Should be a blob we're revoking")

    URL.revokeObjectURL(url);
    // console.log('Blob URL revoked after image loaded');
  }

  ngOnDestroy() {
    // Image not loading on flipped card, problem is it's being destroyed as the card's being flipped, so it's not present in the DOM to be taken images of
    // TODO: Actually call the revoke source somehow
    // This is literally just a workaround and not gonna work
    this.cardFaceImageSrcs.forEach((value: string, key: number) => {
      this.onRevokeSrc(value);
    })
  }
}
