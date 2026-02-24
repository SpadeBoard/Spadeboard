import { Component, input, InputSignal, model, ModelSignal, output, OutputEmitterRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagData, TagifyModule, TagifySettings } from 'ngx-tagify';
import { BehaviorSubject } from 'rxjs';
import { Tag } from '../../../../tagging-system/models/tag';

@Component({
  selector: 'app-card-editor-tags',
  imports: [
    TagifyModule,
    FormsModule
  ],
  templateUrl: './card-editor-tags.component.html',
  styleUrl: './card-editor-tags.component.scss'
})
export class CardEditorTagsComponent {
  public readonly $whitelist: InputSignal<BehaviorSubject<string[]>> = input<BehaviorSubject<string[]>>(new BehaviorSubject<string[]>([]));

  public readonly $cardEditorPreviewTags: ModelSignal<TagData[]> = model<TagData[]>([]);

  public readonly $tag: OutputEmitterRef<{
    operation: 'create' | 'update' | 'delete',
    tag: Tag,
    idx?: number
  }> = output<{
    operation: 'create' | 'update' | 'delete',
    tag: Tag,
    idx?: number
  }>();

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
        console.log(`On edit updated:\nAll tags: ${JSON.stringify(this.$cardEditorPreviewTags())}\nUpdated tag: ${JSON.stringify(e.detail.tag)}`);


        if (!e.detail.data)
          throw new Error("No TagData to update");

        // Have to cast it, otherwise Typescript complains
        let tagElement: HTMLElement & {
          __tagifyTagData?: any;
        } = e.detail.tag as HTMLElement & { __tagifyTagData?: any };

        let tagData: any = tagElement.__tagifyTagData;

        let originalValue: string = tagData?.__originalData?.value;
        let originalId: string = tagData?.__originalData?.__tagId;

        console.log('Original value:', originalValue);
        console.log('Original tagId:', originalId);

        // ASSUMPTION: Tags already exist and have id property, otherwise it will look like default TagData
        let index: number = this.$cardEditorPreviewTags().findIndex(tag => tag.value === originalValue);

        if (index === -1) throw new Error("Could not find tag index for updated tag");

        this.onUpdateTag(index, e.detail.data);
      },
    }
  };

  public readonly $readonly: InputSignal<boolean> = input<boolean>(false);

  public readonly $disabled: InputSignal<boolean> = input<boolean>(false);

  constructor() {}

  protected onAdd(tagify: { tags: TagData[], added: TagData }): void {
    console.log('Added a tag', tagify);
  }

  protected onCreateTag(tagData: TagData): void {
    let tag: Tag = {
      tagId: "0",
      tagName: tagData.value
    }

    this.$tag.emit({ operation: 'create', tag });
  }

  protected onUpdateTag(idx: number, tagData: TagData): void {
    let tag: Tag = {
      tagId: "0",
      tagName: tagData.value
    }

    this.$tag.emit({ operation: 'update', tag, idx });
  }

  protected onDeleteTag(tagData: TagData): void {
    let tag: Tag = {
      tagId: "0",
      tagName: tagData.value
    }

    this.$tag.emit({ operation: 'delete', tag });
  }

  protected onRemove(tags: TagData[]): void {
    console.log('Removed a tag', tags);
  }
}
