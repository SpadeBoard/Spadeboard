import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { assertObjectsMatch } from '../../../../../../utils/checks.utils';
import { logInfo, stringify } from '../../../../../../utils/utils';
import { Style } from '../../../../../style/models/style';
import { CardFace } from '../../../../card-face/models/card-face';
import { CardEditorCardDto } from '../../../../card-editor/models/card-editor-card-dto';
import { CardEditorCardFaceDto } from '../../../../card-editor/models/card-editor-card-face-dto';
import { CardFaceElementPerCardFace } from '../../../../card-face-element/models/card-face-element';
import { DEFAULT_CARD_EDITOR_FACE_STYLE, getBlankCardTemplate, getCurrentCardFaceId, getCurrentCardFaceIndex, setCurrentCardFaceId } from '../../../../card-editor/constants/card-editor.constants';
import { getDefaultCardFace } from '../../../../card-face/constants/card-face.constants';
import { isCardEditorCardDto } from '../../../../utils/card-game-core.utils';
import { DEFAULT_USER_ID } from '../../../../../user/constants/user.constants';

@Injectable({
  providedIn: 'root'
})
export class CardEditorPreviewService {
  public readonly userId: string = DEFAULT_USER_ID;

  // FIXME: Reset this everytime you open the card editor via the button on the side
  public cardEditorCardDto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, this.userId);

  public currentCardEditorCardFaceDto: CardEditorCardFaceDto = {
    cardFace: getDefaultCardFace(),
    cardFaceElementsPerCardFace: [],
    fileMetadataLods: []
  };

  private setCardEditorCardDto$$: Subject<void> = new Subject<void>();
  public readonly setCardEditorCardDto$: Observable<void> = this.setCardEditorCardDto$$.asObservable();

  constructor() {
    this.setBlankCardTemplate();
  }

  // NOTE: For when clicking on a blank card template
  public setBlankCardTemplate(): void {
    this.setCardEditorCardDto(getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, this.userId));
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

    assertObjectsMatch(map, `${logInfo(this.constructor.name, this.setCurrentCardFaceElementsPerCardFace.name)} - assertCardFaceElementsPerCardFace`);
  }

  public isNewCardEditorCardDto(): boolean {
    return parseFloat(this.cardEditorCardDto.card.cardId) <= 0;
  }

  public setCurrentCardEditorCardFaceDto(): void {
    this.currentCardEditorCardFaceDto = this.cardEditorCardDto.cardEditorCardFacesDto[this.getCurrentCardFaceIndex()];
  }

  public setCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    if (!isCardEditorCardDto(cardEditorCardDto)) throw new Error(`${logInfo(this.constructor.name, this.setCardEditorCardDto.name)}: Not a card editor card dto`);

    console.log(`%c${logInfo(this.constructor.name, this.setCardEditorCardDto.name)} (before):\nArg:\n${stringify(cardEditorCardDto)}\nCurrent:\n${stringify(this.cardEditorCardDto)}`, `color: #3A015C; background: #fce3f9ff; padding: 5px; border-radius: 5px;`);

    this.cardEditorCardDto = {...cardEditorCardDto};
    this.setCurrentCardEditorCardFaceDto(); 

    this.setCardEditorCardDto$$.next();

    console.log(`%c${logInfo(this.constructor.name, this.setCardEditorCardDto.name)} (after):\nCurrent:\n${stringify(this.cardEditorCardDto)}`, `color: #1b4965; background: #8cd0e0ff; padding: 5px; border-radius: 5px;`);
  }

  public getCurrentCardFaceId(): string {
    return getCurrentCardFaceId(this.cardEditorCardDto.card);
  }

  public getCurrentCardFaceIndex(): number {
    return getCurrentCardFaceIndex(this.getCurrentCardFaceId(), this.cardEditorCardDto.cardEditorCardFacesDto);
  }

  public getCurrentCardFace(): CardFace {
    return this.currentCardEditorCardFaceDto.cardFace;
  }

  public getCurrentCardFaceStyle(): Style {
    return this.currentCardEditorCardFaceDto.cardFace.style;
  }

  public setCurrentCardFaceStyle(style: Style): void {
    this.currentCardEditorCardFaceDto.cardFace.style = {...style};
  }

  public isFlipped(): boolean {
    return (this.getCurrentCardFaceIndex()) ? false : true;
  }

  public setCurrentCardFaceId(): void {
    this.cardEditorCardDto.card.currentCardFaceId = setCurrentCardFaceId(this.getCurrentCardFaceIndex(), this.cardEditorCardDto.cardEditorCardFacesDto);
  }

  public toggleCurrentCardFace(): void {
    this.setCurrentCardFaceId();
    this.setCurrentCardEditorCardFaceDto();

    console.log(`%c${logInfo(this.constructor.name, this.toggleCurrentCardFace.name)}:\ncurrentCardFaceIndex: ${this.getCurrentCardFaceId()}`, `color: #211103; background: #f8e5ee; padding: 5px; border-radius: 5px;`);
  }
}
