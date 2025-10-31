import { inject, Injectable } from '@angular/core';
import { Card, CardEditorCardDto } from '../../../models/card';
import { Tag } from '../../../../tagging-system/models/tag';
import { TagsPerCardApiService } from '../api/tags-per-card-api.service';
import { Observable, of } from 'rxjs';
import { clear, stringify } from '../../../../../utils/utils';
import { isCardEditorCardDto } from '../../../utils/card-game-core.utils';

@Injectable({
  providedIn: 'root'
})
export class CardTemplateService {
  private readonly tagsPerCardApiService: TagsPerCardApiService = inject(TagsPerCardApiService);;

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
      let { cardId } = identifier.card;

      return cards.filter(c => c.cardId !== cardId && !this.isCardTemplate(identifier));
    }

    if (typeof identifier === 'string') {
      return cards.filter(c => c.cardId !== identifier);
    }

    throw new Error("Remove card template requires card ID or card editor card dto");
  }

  public addTag(tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    if (cardEditorCardDto.tagNames.includes(tag.tagName))
      throw new Error("Already has tag name included");

    cardEditorCardDto.tagNames.push(tag.tagName);

    if (!tagNamesToDelete)
      return;

    tagNamesToDelete = tagNamesToDelete.filter((t: string) => t !== tag.tagName);

    if (tagNamesToDelete.includes(tag.tagName))
      throw new Error(`Tag names to delete should not include: ${tag.tagName} after filtering`);
  }

  public updateTag(idx: number, tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    if (!cardEditorCardDto.tagNames[idx])
      throw new Error("Index for this tag does not exist");

    if (tagNamesToDelete) tagNamesToDelete.push(cardEditorCardDto.tagNames[idx]);

    cardEditorCardDto.tagNames[idx] = tag.tagName;
  }

  public deleteTag(tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    cardEditorCardDto.tagNames = cardEditorCardDto.tagNames.filter((t: string) => t !== tag.tagName);

    if (cardEditorCardDto.tagNames.includes(tag.tagName))
      throw new Error(`Tag names should not include: ${tag.tagName} after filtering`);

    if (tagNamesToDelete) tagNamesToDelete.push(tag.tagName);
  }

  public getCardTemplates(ownerId: string, cards: Card[]): void {
    this.tagsPerCardApiService.getCardTemplatesByOwnerId$(ownerId).subscribe((c: Card[] | undefined) => {
      console.log(`%c${this.constructor.name} - ${ this.tagsPerCardApiService.getCardTemplatesByOwnerId$.name}:\n${stringify(c)}`, `color: #A75D5D; background: #FFC3A1; padding: 5px; border-radius: 5px;`);

      if (c) cards.push(...c);
    });
  }

  public deleteTagsPerCard$(tagNamesToDelete: string[], cardId: string): Observable<any> {
    if (tagNamesToDelete.length <= 0) {
      return of(undefined);
    }

    return this.tagsPerCardApiService.deleteByTagNamesAndCardId$(tagNamesToDelete, cardId);
  }
}
