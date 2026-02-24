import { Injectable } from '@angular/core';
import { Tag } from '../../../../tagging-system/models/tag';
import { CardEditorCardDto } from '../../models/card-editor-card-dto';
import { clear } from '../../../../../utils/utils';
import { TagData } from '@yaireo/tagify';

@Injectable({
  providedIn: 'root',
})
export class CardEditorTagService {
    // CHECKME: Do we just want to remove this? Since we're deleting tags in the backend
  public tagNamesToDelete: string[] = [];
  
  public clear(): void {
    clear(this.tagNamesToDelete);
  }

  public populateTags(tagNames: readonly string[]): TagData[] {
    return tagNames.map(
      (tagName: string) => ({ value: tagName })
    );
  }

  public addTag(tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    if (cardEditorCardDto.tagNames.includes(tag.tagName))
      throw new Error("Already has tag name included");

    cardEditorCardDto.tagNames.push(tag.tagName);

    if (!tagNamesToDelete) return;

    tagNamesToDelete = tagNamesToDelete.filter((t: string) => t !== tag.tagName);

    if (tagNamesToDelete.includes(tag.tagName)) throw new Error(`Tag names to delete should not include: ${tag.tagName} after filtering`);
  }

  public updateTag(idx: number, tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    if (!cardEditorCardDto.tagNames[idx])
      throw new Error("Index for this tag does not exist");

    if (tagNamesToDelete) tagNamesToDelete.push(cardEditorCardDto.tagNames[idx]);

    cardEditorCardDto.tagNames[idx] = tag.tagName;
  }

  public deleteTag(tag: Tag, cardEditorCardDto: CardEditorCardDto, tagNamesToDelete?: string[]): void {
    cardEditorCardDto.tagNames = cardEditorCardDto.tagNames.filter((t: string) => t !== tag.tagName);

    if (cardEditorCardDto.tagNames.includes(tag.tagName)) throw new Error(`Tag names should not include: ${tag.tagName} after filtering`);

    if (tagNamesToDelete) tagNamesToDelete.push(tag.tagName);
  }
}
