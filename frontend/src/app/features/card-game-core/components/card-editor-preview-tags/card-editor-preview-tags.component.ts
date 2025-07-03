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
      click: (e) => { console.log(`On tag callback click: ${e.detail}`); }
    }
  };
  
  // TODO: Load the whitelist based on backend
  whitelist$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  
  readonly: InputSignal<boolean> = input<boolean>(false);
  readonlyComputed: Signal<boolean> = computed(() => this.readonly());

  disabled: InputSignal<boolean> = input<boolean>(false);
  disabledComputed: Signal<boolean> = computed(() => this.disabled());

  constructor() {
    this.onSetCardEditorCardDtoByCardId();
    this.refreshWhitelist();
  }

  private onSetCardEditorCardDtoByCardId(): void {
    this.cardEditorPreviewService.onSetCardEditorCardDtoByCardId$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.tagApiService.getTagNamesByCardId$(this.cardEditorPreviewService.cardEditorCardDto.card.cardId).subscribe((tagNames: string[] | undefined) => {
          if (!tagNames)
            return;

          tagNames.map((tagName: string) => {
            let tagData: TagData = { value: tagName };
            this.tags.push(tagData);
          });
        });
      });
    }
  
  onAdd(tagify: {tags: TagData[], added: TagData}) {
    console.log('Added a tag', tagify);  

    this.onCreateTag(tagify.added);
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
          this.cardEditorPreviewService.addTag(existingTag, this.cardEditorPreviewService.cardEditorCardDto);
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
      this.cardEditorPreviewService.addTag(createdTag, this.cardEditorPreviewService.cardEditorCardDto);
      this.refreshWhitelist();
    });
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
    // TODO: How to figure out the tag we just removed, modify the card editor card dto
  }
}
