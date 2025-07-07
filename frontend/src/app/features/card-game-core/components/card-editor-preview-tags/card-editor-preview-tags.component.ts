import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagData, TagifyModule, TagifySettings } from 'ngx-tagify'; 
import { BehaviorSubject, catchError, EMPTY, switchMap } from 'rxjs';
import { TagApiService } from '../../../tagging-system/services/tag-api.service';
import { Tag } from '../../../tagging-system/models/tag';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-card-editor-preview-tags',
  imports: [TagifyModule, FormsModule],
  templateUrl: './card-editor-preview-tags.component.html',
  styleUrl: './card-editor-preview-tags.component.scss'
})
export class CardEditorPreviewTagsComponent {
  // TODO: Refactor this to potentially be reusable
  private readonly tagApiService: TagApiService = inject(TagApiService);
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);
  
  tags: TagData[] = [];

  settings: TagifySettings = {
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
        console.log(`On edit updated: ${JSON.stringify(e.detail.tag)}`); 

        if (!e.detail.data)
          throw new Error("No TagData to update");

        let index: number = this.tags.findIndex(tag => tag['id']=== e.detail.tag!['id']);
        if (index === -1)
          throw new Error("Could not find tag index for updated tag");

        this.onUpdateTag(index, e.detail.data);
      },
    }
  };
  
  // TODO: Load the whitelist based on backend
  whitelist$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  
  readonly: InputSignal<boolean> = input<boolean>(false);
  readonlyComputed: Signal<boolean> = computed(() => this.readonly());

  disabled: InputSignal<boolean> = input<boolean>(false);
  disabledComputed: Signal<boolean> = computed(() => this.disabled());

  constructor() {
    this.populateTags();
    
    this.onSetCardEditorCardDtoByCardId();
    this.refreshWhitelist();
  }

  private onSetCardEditorCardDtoByCardId(): void {
    this.cardEditorPreviewService.onSetCardEditorCardDtoByCardId$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
       this.populateTags();
      });
    }

  private populateTags(): void {
    this.tags = this.cardEditorPreviewService.cardEditorCardDto.tagNames.map(
      (tagName: string, idx: number) => ({ id: String(idx), value: tagName })
    );
  }
  
  onAdd(tagify: {tags: TagData[], added: TagData}) {
    console.log('Added a tag', tagify);  
  }

  onCreateTag(tagData: TagData) {
    let tag: Tag = {
      tagId: "0",
      tagName: tagData.value
    }

    // TODO: This should be its own utility function, to be usable with imports
    this.tagApiService.getTagByTagName$(tag.tagName)
    .pipe(
      switchMap((existingTag: Tag | undefined) => {
        if (existingTag) {
          this.cardEditorPreviewService.addTag(existingTag, this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.tagNamesToDelete);
          console.log('Tag already exists');
          
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
          console.error('Error fetching tag:', err);
          return EMPTY;
        }
      })
    )
    .subscribe((createdTag: Tag | undefined) => {
      if (!createdTag) {
        console.warn('Tag could not be created.');
        return;
      }

      console.log('Tag has been created.');
      this.cardEditorPreviewService.addTag(createdTag, this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.tagNamesToDelete);
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
          this.cardEditorPreviewService.updateTag(idx, existingTag, this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.tagNamesToDelete);
          console.log('Tag already exists');
          
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
          console.error('Error fetching tag:', err);
          return EMPTY;
        }
      })
    )
    .subscribe((createdTag: Tag | undefined) => {
      if (!createdTag) {
        console.warn('Tag could not be created.');
        return;
      }

      console.log('Tag has been created.');
      this.cardEditorPreviewService.updateTag(idx, createdTag, this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.tagNamesToDelete);
      this.refreshWhitelist();
    });
  }

  onDeleteTag(tagData: TagData): void {
    let tag: Tag = {
      tagId: "0",
      tagName: tagData.value
    }

    this.cardEditorPreviewService.deleteTag(tag, this.cardEditorPreviewService.cardEditorCardDto, this.cardEditorPreviewService.tagNamesToDelete);
  }

  private refreshWhitelist(): void {
    this.tagApiService.getTagNames$().subscribe((tagNames: string[] | undefined) => {
      if (!tagNames)
        return;

      this.whitelist$$.next(tagNames);
    });
  }
  
  onRemove(tags: TagData[]) {
    console.log('Removed a tag', tags);
  }
}
