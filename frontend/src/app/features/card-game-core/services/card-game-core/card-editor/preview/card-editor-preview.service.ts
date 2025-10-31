import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { assertObjectsMatch } from '../../../../../../utils/checks.utils';
import { FileMetadataService } from '../../../../../../utils/services/file/metadata/facade/file-metadata.service';
import { stringify } from '../../../../../../utils/utils';
import { CardEditorCardDto } from '../../../../models/card';
import { CardEditorCardFaceDto, CardFace } from '../../../../models/card-face';
import { CardFaceElementPerCardFace } from '../../../../models/card-face-element';
import { DEFAULT_CARD_EDITOR_FACE_STYLE, getBlankCardTemplate } from '../../../../utils/card-editor.constants';
import { getDefaultCardFace } from '../../../../utils/card-face.constants';
import { isCardEditorCardDto } from '../../../../utils/card-game-core.utils';
import { UserService } from '../../../user/user.service';
import { CardEditorCardDtoApiService } from '../../api/card-editor-card-dto-api.service';
import { CardEditorApiService } from '../api/card-editor-api.service';

@Injectable({
  providedIn: 'root'
})
export class CardEditorPreviewService {
  private readonly cardEditorCardDtoApiService: CardEditorCardDtoApiService = inject(CardEditorCardDtoApiService);

  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);

  private readonly fileMetadataService: FileMetadataService = inject(FileMetadataService);
  
  private readonly userService: UserService = inject(UserService);

  // FIXME: Reset this everytime you open the card editor via the button on the side
  public cardEditorCardDto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, this.userService.$userId());

  public currentCardEditorCardFaceDto: CardEditorCardFaceDto = {
    cardFace: getDefaultCardFace(),
    cardFaceElementsPerCardFace: [],
    fileMetadataLods: []
  };

  public $isCardEditorOpen: WritableSignal<boolean> = signal<boolean>(false);

  private setCardEditorCardDto$$: Subject<void> = new Subject<void>();
  public readonly setCardEditorCardDto$: Observable<void> = this.setCardEditorCardDto$$.asObservable();

  constructor() {
    this.setBlankCardTemplate();
  }

  public setIsCardEditorOpen(isCardEditorOpen: boolean): void {
    this.$isCardEditorOpen.set(isCardEditorOpen);
  }

  // NOTE: For when clicking on a blank card template
  public setBlankCardTemplate(): void {
    this.setCardEditorCardDto(getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, this.userService.$userId()));
  }

  public setCardEditorCardDtoByCardId(cardId: string): void {
    // CHECKME:
    // Prevents accidentally orphaning file metadata we stored for a previous card but never did anything with it
    // Also does that with other stuff like tags as well, we don't want to add tags to an uncreated card or accidentally transfer them
    this.clearItemsToDelete();

    if (parseFloat(cardId) <= 0) {
      this.setBlankCardTemplate();
      return;
    }

    // CHECKME:
    // To keep the information that we had, including the orphaned file metadata
    // Actually this is probably unnecessary because the default state is pending, so either way, unless we're creating/saving, it will never be attached
    // if (this.cardEditorCardDto.card.cardId === cardId) return;

    this.getCardEditorCardDtoByCardId(cardId);
  }

  // CHECKME: Do we want to have a takeUntilDestroyed for early cancellations and performance reasons?
  public getCardEditorCardDtoByCardId(cardId: string): void {
    this.cardEditorCardDtoApiService.getCardEditorCardDtoByCardId$(cardId)
      .subscribe((cardEditorCardDto: CardEditorCardDto | undefined) => {
        if (cardEditorCardDto) {
          console.assert(cardEditorCardDto.card.cardId === cardId, `${this.constructor.name} - ${this.getCardEditorCardDtoByCardId.name}: cardEditorCardDto.card.cardId and cardId (argument) mismatch`);
          this.setCardEditorCardDto(cardEditorCardDto);
        }
      });
  }

  public setCardName(value: string): void {
    this.cardEditorCardDto.card.cardName = value;
  }

  public getCardName(): string {
    return this.cardEditorCardDto.card.cardName;
  }

  public getCurrentCardFaceElementsPerCardFaceAmt(): number {
    return this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace.length;
  }

  public getCurrentCardFaceElementsPerCardFace(): CardFaceElementPerCardFace[] {
    return this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace;
  }

  public setCurrentCardFaceElementsPerCardFace(currentCardFaceElementsPerCardFace: CardFaceElementPerCardFace[]): void {
    this.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace = currentCardFaceElementsPerCardFace;

    let map: Map<string, CardFaceElementPerCardFace[]> = new Map<string, CardFaceElementPerCardFace[]>([
      ['currentCardFaceElementsPerCardFace', currentCardFaceElementsPerCardFace],
      ['currentCardEditorCardFaceDto', this.getCurrentCardFaceElementsPerCardFace()],
      ['cardEditorCardDto', this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()].cardFaceElementsPerCardFace]
    ]);

    assertObjectsMatch(map, `${this.setCurrentCardFaceElementsPerCardFace.name} - assertCardFaceElementsPerCardFace`);
  }

  public isNewCardEditorCardDto(): boolean {
    return parseFloat(this.cardEditorCardDto.card.cardId) <= 0;
  }

  public setCurrentCardEditorCardFaceDto(): void {
    this.currentCardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()];
  }

  // TODO: Refactor later
  public assertCardEditorCardFace(cardEditorCardFaceDto: CardEditorCardFaceDto): void {
    let a: CardEditorCardFaceDto = cardEditorCardFaceDto;
    let b: CardEditorCardFaceDto = this.currentCardEditorCardFaceDto;
    let c: CardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()];

    console.assert(
      JSON.stringify(a) === JSON.stringify(b) &&
      JSON.stringify(b) === JSON.stringify(c),
      'assertCardEditorCardFaceDto: Card editor card face dto mismatch',
      { a, b, c }
    );

    console.assert(!(a === b && b === c) === false, 'assertCardEditorCardFaceDto: References are not identical', { a, b, c });
  }

  public setCardEditorCardFaceDto(cardEditorCardFaceDto: CardEditorCardFaceDto): void;
  public setCardEditorCardFaceDto(cardEditorCardFaceDto: CardEditorCardFaceDto, currentCardFaceIndex: number): void;
  public setCardEditorCardFaceDto(cardEditorCardFaceDto: CardEditorCardFaceDto, currentCardFaceIndex?: number): void {
    let idx: number = (currentCardFaceIndex) ? currentCardFaceIndex : this.getCurrentCardFaceIndex();
    this.cardEditorCardDto.cardEditorCardFacesDto[idx] = cardEditorCardFaceDto;

    // TODO: Refactor later
    /*let map: Map<string, CardEditorCardFaceDto> = new Map<string, CardEditorCardFaceDto>([
      ['cardEditorCardFaceDto', cardEditorCardFaceDto],
      ['currentCardEditorCardFaceDto', this.getCurrentCardFaceElementsPerCardFace()],
      ['cardEditorCardDto', this.cardEditorCardDto.cardEditorCardFacesDto[idx]]
    ]);*/

    this.assertCardEditorCardFace(cardEditorCardFaceDto);
  }

  public setCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    if (!isCardEditorCardDto(cardEditorCardDto)) throw new Error(`${this.constructor.name} - ${this.setCardEditorCardDto.name}: Not a card editor card dto`);

    console.log(`%c${this.constructor.name} - ${this.setCardEditorCardDto.name} (before):\n${stringify(cardEditorCardDto)}\n${stringify(this.cardEditorCardDto)}`, `color: #3A015C; background: #fce3f9ff; padding: 5px; border-radius: 5px;`);

    this.cardEditorCardDto = cardEditorCardDto;
    this.setCurrentCardEditorCardFaceDto(); // CHECKME: Is it fine to call it, not modular enough?
    this.setCardEditorCardDto$$.next();

    console.log(`%c${this.constructor.name} - ${this.setCardEditorCardDto.name} (after):\n${stringify(this.cardEditorCardDto)}`, `color: #1b4965; background: #8cd0e0ff; padding: 5px; border-radius: 5px;`);
  }

  public getCurrentCardFaceIndex(): number {
    return this.cardEditorCardDto.card.currentCardFaceIndex;
  }

  public getCurrentCardFace(): CardFace {
    return this.currentCardEditorCardFaceDto.cardFace;
  }

  public getCardTagNames(): readonly string[] {
    return this.cardEditorCardDto.tagNames;
  }

  public isFlipped(): boolean {
    return (this.cardEditorCardDto.card.currentCardFaceIndex === 0) ? false : true;
  }

  public setCurrentCardFace(): void {
    this.cardEditorCardDto.card.currentCardFaceIndex = (this.getCurrentCardFaceIndex() === 0) ? 1 : 0;
  }

  // FIXME: Why is it flipping twice, observables and supscription maybe?
  public onFlipCurrentCardFace(): void {
    this.setCurrentCardFace();
    this.setCurrentCardEditorCardFaceDto();

    console.log(`%c${this.constructor.name} - ${this.onFlipCurrentCardFace.name} (time: ${Date.now().toLocaleString("en-US")})}:\ncurrentCardFaceIndex: ${this.getCurrentCardFaceIndex()}`, `color: #211103; background: #f8e5ee; padding: 5px; border-radius: 5px;`);
  }

  public postApiOperations(cardEditorCardDto: CardEditorCardDto, operation: 'create' | 'duplicate' | 'update'): void {
    let color: string = '', background: string = '';

    this.setCardEditorCardDto(cardEditorCardDto);

    switch (operation) {
      case 'create': {
        this.postCreateCardEditorCardDto(cardEditorCardDto);
        color = '#7D6E83', background = '#F8EDE3';
        break;
      }
      case 'duplicate': {
        this.postDuplicateCardEditorCardDto(cardEditorCardDto);
        color = '#87805E', background = '#EDDFB3';
        break;
      }
      case 'update': {
        this.postUpdateCardEditorCardDto(cardEditorCardDto);
        color = '#798777', background = '#F8EDE3';
        break;
      }
    }

    console.log(
      `%c${this.constructor.name} - ${this.postApiOperations.name} - ${operation}\nCard editor card dto:\n${stringify(cardEditorCardDto)}`,
      `color: ${color}; background: ${background}; padding: 5px; border-radius: 5px;`
    );
  }

  // NOTE: Why this.cardEditorCardDto?
  // ASSUMPTION: We are updating the card editor card dto for the CARD EDITOR
  // TODO: Rework this to be in cardEditorPreviewService?
  private postCreateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.orphanFileMetadata();

    this.cardEditorApiService.createdCardEditorCardDto(cardEditorCardDto);

    // We don't want to clear the items to be deleted because it's possible that we're updating the card instead of duplicating it
    // So that's why it gets cleared when we switch the card instead
  }

  private postDuplicateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    // NOTE: Because of how this works, we want to orphan the file metadata first
    // There's a check that if the files aren't orphaned in orphanedFileMetadata, you can't clear it
    this.postCreateCardEditorCardDto(cardEditorCardDto);

    // Because we're making a duplicate, you don't want to store the card face elements to delete, only do it for saving
    // We also want to set the to be oprhaned metadata to be nothing, since we're starting with a newly duplicated card
    this.clearItemsToDelete();
  }

  // TODO: Rework this to be in cardEditorPreviewService?
  private postUpdateCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.orphanFileMetadata();

    this.cardEditorApiService.updatedCardEditorCardDto(cardEditorCardDto);

    // CHECKME: Do we want to call it here?
    // This should theoretically be fine because we mark the file metadata as orphaned beforehand
    this.clearItemsToDelete();
  }

  private orphanFileMetadata(): void {
    this.fileMetadataService.orphan();
  }

  private clearItemsToDelete(): void {
    this.cardEditorApiService.clear();
  }
}
