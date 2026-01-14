import { Component, inject, input, InputSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TagData, TagifyModule, TagifySettings } from 'ngx-tagify';
import { BehaviorSubject, catchError, EMPTY, switchMap } from 'rxjs';
import { Tag } from '../../../tagging-system/models/tag';
import { TagApiService } from '../../../tagging-system/services/tag-api.service';
import { CardEditorApiService } from '../../services/card-game-core/card-editor/api/card-editor-api.service';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardTemplateService } from '../../services/card-game-core/card-template/card-template.service';
import { stringify } from '../../../../utils/utils';

@Component({
  selector: 'app-card-editor-preview-tags',
  imports: [TagifyModule, FormsModule],
  templateUrl: './card-editor-preview-tags.component.html',
  styleUrl: './card-editor-preview-tags.component.scss'
})
export class CardEditorPreviewTagsComponent {
  // TODO: Refactor this to potentially be reusable
  private readonly tagApiService: TagApiService = inject(TagApiService);
  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardTemplateService: CardTemplateService = inject(CardTemplateService);
  
  protected tags: TagData[] = [];

  protected settings: TagifySettings = {
    placeholder: 'Insert tag, ex. Template',
    blacklist: [], // TODO: Replace blacklist with custom one, potentially set by admin?
    callbacks: {
      add: (e: CustomEvent<Tagify.AddEventData<TagData>>) => {
        console.log(`On tag added: ${JSON.stringify(e.detail.data)}`);

        if (!e.detail.data)
          throw new Error("No TagData to add");

        this.onCreateTag(e.detail.data);
      },
      click: (e: CustomEvent<Tagify.ClickEventData<TagData>>) => { 
        console.log(`On tag callback click: ${JSON.stringify(e.detail.tag)}`); 
      },
      remove: (e: CustomEvent<Tagify.RemoveEventData<TagData>>) => { 
        console.log(`On tag removed: ${JSON.stringify(e.detail.data)}`); 
        
        if (!e.detail.data)
          throw new Error("No TagData to remove");

        this.onDeleteTag(e.detail.data);
      },
      "edit:updated": (e: CustomEvent<Tagify.EditUpdatedEventData<TagData>>) => {
        console.log(`On edit updated:\nAll tags: ${JSON.stringify(this.tags)}\nUpdated tag: ${JSON.stringify(e.detail.tag)}`); 
        
        
        if (!e.detail.data)
          throw new Error("No TagData to update");

        // Have to cast it, otherwise Typescript complains
        let tagElement = e.detail.tag as HTMLElement & { __tagifyTagData?: any };
        let tagData = tagElement.__tagifyTagData;

        let originalValue: string = tagData?.__originalData?.value;
        let originalId : string= tagData?.__originalData?.__tagId;

        console.log('Original value:', originalValue);
        console.log('Original tagId:', originalId);

        // ASSUMPTION: Tags already exist and have id property, otherwise it will look like default TagData
        let index: number = this.tags.findIndex(tag => tag.value === originalValue);
        if (index === -1)
          throw new Error("Could not find tag index for updated tag");

        this.onUpdateTag(index, e.detail.data);
      },
    }
  };
  
  // TODO: Load the whitelist based on backend
  protected whitelist$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  
  public $readonly: InputSignal<boolean> = input<boolean>(false);

  public $disabled: InputSignal<boolean> = input<boolean>(false);

  constructor() {
    this.populateTags();
    
    this.setCardEditorCardDto();
    this.refreshWhitelist();

    this.clearTagsToDelete();
  }

  private setCardEditorCardDto(): void {
    this.cardEditorPreviewService.setCardEditorCardDto$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
       this.populateTags();
      });
    }

  private populateTags(): void {
    console.log(`%c${this.constructor.name} - ${this.populateTags.name}: ${stringify(this.cardEditorPreviewService.getCardTagNames())}`, 'color: #56021F; background: #F4CCE9; padding: 5px; border-radius: 5px;');

    this.tags = this.cardEditorPreviewService.getCardTagNames().map(
      (tagName: string) => ({ value: tagName })
    );
  }
  
  protected onAdd(tagify: {tags: TagData[], added: TagData}): void {
    console.log('Added a tag', tagify);  
  }

  onCreateTag(tagData: TagData): void {
    let tag: Tag = {
      tagId: "0",
      tagName: tagData.value
    }

    // TODO: This should be its own utility function, to be usable with imports
    this.tagApiService.getTagByTagName$(tag.tagName)
    .pipe(
      switchMap((existingTag: Tag | undefined) => {
        if (existingTag) {
          this.cardTemplateService.addTag(existingTag, this.cardEditorPreviewService.cardEditorCardDto, this.cardTemplateService.tagNamesToDelete);
          console.log(`Tag already exists: ${JSON.stringify(existingTag, null, 2)}`);
          
          return EMPTY; 
        } 
        else {
          return this.tagApiService.createTag$(tag);
        }
      }),
      catchError(err => {
        if (err.status === 404) {
          return this.tagApiService.createTag$(tag);
        } 
        else {
          console.warn('Error fetching tag:', err);
          return EMPTY;
        }
      })
    )
    .subscribe((createdTag: Tag | undefined) => {
      if (!createdTag) {
        console.warn('Tag could not be created.');
        return;
      }

      console.log(`Tag has been created: ${JSON.stringify(createdTag, null, 2)}`);
      this.cardTemplateService.addTag(createdTag, this.cardEditorPreviewService.cardEditorCardDto, this.cardTemplateService.tagNamesToDelete);
      this.refreshWhitelist();
    });
  }

  onUpdateTag(idx: number, tagData: TagData) {
    let tag: Tag = {
      tagId: "0",
      tagName: tagData.value
    }

    // TODO: This should be its own utility function, to be usable with imports
    this.tagApiService.getTagByTagName$(tag.tagName)
    .pipe(
      switchMap((existingTag: Tag | undefined) => {
        if (existingTag) {
          this.cardTemplateService.updateTag(idx, existingTag, this.cardEditorPreviewService.cardEditorCardDto, this.cardTemplateService.tagNamesToDelete);
          console.log(`Tag already exists: ${JSON.stringify(existingTag, null, 2)}`);
          
          return EMPTY; 
        } 
        else {
          return this.tagApiService.createTag$(tag);
        }
      }),
      catchError(err => {
        if (err.status === 404) {
          return this.tagApiService.createTag$(tag);
        } 
        else {
          console.warn('Error fetching tag:', err);
          return EMPTY;
        }
      })
    )
    .subscribe((createdTag: Tag | undefined) => {
      if (!createdTag) {
        console.warn('Tag could not be created.');
        return;
      }

      console.log(`Tag has been created: ${JSON.stringify(createdTag, null, 2)}`);
      this.cardTemplateService.updateTag(idx, createdTag, this.cardEditorPreviewService.cardEditorCardDto, this.cardTemplateService.tagNamesToDelete);
      this.refreshWhitelist();
    });
  }

  protected onDeleteTag(tagData: TagData): void {
    let tag: Tag = {
      tagId: "0",
      tagName: tagData.value
    }

    this.cardTemplateService.deleteTag(tag, this.cardEditorPreviewService.cardEditorCardDto, this.cardTemplateService.tagNamesToDelete);
  }

  private refreshWhitelist(): void {
    this.tagApiService.getTagNames$().subscribe((tagNames: string[] | undefined) => {
      if (!tagNames)
        return;

      this.whitelist$$.next(tagNames);
    });
  }
  
  protected onRemove(tags: TagData[]): void {
    console.log('Removed a tag', tags);
  }

  private clearTagsToDelete(): void {
    this.cardEditorApiService.clear$.subscribe(() => {
      this.cardTemplateService.clear();
    });
  }
}
