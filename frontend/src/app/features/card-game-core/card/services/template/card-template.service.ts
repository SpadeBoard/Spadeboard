import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { clear, logInfo, stringify } from '../../../../../utils/utils';
import { Card} from '../../models/card';
import { CardEditorCardDto } from '../../../card-editor/models/card-editor-card-dto';
import { isCardEditorCardDto } from '../../../utils/card-game-core.utils';
import { TagsPerCardApiService } from '../../../services/card-game-core/api/tags-per-card-api.service';

@Injectable({
  providedIn: 'root'
})
export class CardTemplateService {
  private readonly tagsPerCardApiService: TagsPerCardApiService = inject<TagsPerCardApiService>(TagsPerCardApiService);;

  // CHECKME: Do we just want to remove this?
  public tagNamesToDelete: string[] = [];

  constructor() { }

  public clear(): void {
    clear(this.tagNamesToDelete);
  }

  // NOTE: Case insensitive, accent sensitive
  public isCardTemplate(cardEditorCardDto: CardEditorCardDto): boolean {
    return cardEditorCardDto.tagNames
      .some(tag => tag.localeCompare('Template', undefined, { sensitivity: 'accent' }) === 0);
  }

  // TODO: Make it private
  public addCardTemplate(cardEditorCardDto: CardEditorCardDto, cards: Card[]): boolean {
    let { card } = cardEditorCardDto;

    if (this.isCardTemplate(cardEditorCardDto)) {
      cards.push({ ...card });
      return true;
    }

    return false;
  }

  // TODO: Make it private
  // TODO: Have it work just for removing the card itself too without checking whether it's card template first
  public removeCardTemplate(cardId: string, cards: Card[]): Card[];
  public removeCardTemplate(cardEditorCardDto: CardEditorCardDto, cards: Card[]): Card[];
  public removeCardTemplate(identifier: CardEditorCardDto | string, cards: Card[]): Card[] {
    if (isCardEditorCardDto(identifier)) {
      if (this.isCardTemplate(identifier)) return cards;

      let { cardId } = identifier.card;

      return cards.filter(c => c.cardId !== cardId);
    }

    if (typeof identifier === 'string') {
      return cards.filter(c => c.cardId !== identifier);
    }

    throw new Error("Remove card template requires card ID or card editor card dto");
  }

  public getCardTemplates(ownerId: string, cards: Card[]): void {
    this.tagsPerCardApiService.getCardTemplatesByOwnerId$(ownerId).subscribe((c: Card[] | undefined) => {
      console.log(`%c${logInfo(this.constructor.name, this.tagsPerCardApiService.getCardTemplatesByOwnerId$.name)}:\n${stringify(c)}`, `color: #A75D5D; background: #FFC3A1; padding: 5px; border-radius: 5px;`);

      if (c) cards.push(...c);
    });
  }

  public deleteTagsPerCard$(tagNamesToDelete: string[], cardId: string): Observable<any> {
    if (tagNamesToDelete.length <= 0) {
      return of(undefined);
    }

    return this.tagsPerCardApiService.deleteByTagNamesAndCardId$(tagNamesToDelete, cardId);
  }
  /******************* PUT THIS SOMEWHERE ELSE ***********************/
}
