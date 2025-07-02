import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagData, TagifyModule, TagifySettings } from 'ngx-tagify'; 
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-card-editor-preview-tags',
  imports: [TagifyModule, FormsModule],
  templateUrl: './card-editor-preview-tags.component.html',
  styleUrl: './card-editor-preview-tags.component.scss'
})
export class CardEditorPreviewTagsComponent {
  tags: TagData[] = [];

  settings: TagifySettings = {
    placeholder: 'Insert tag, ex. Template',
    blacklist: [], // TODO: Replace blacklist with custom one
    callbacks: {
      click: (e) => { console.log(`On tag callback click: ${e.detail}`); }
    }
  };
  
  // TODO: Load the whitelist based on backend
  whitelist$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['Template']);
  
  readonly: boolean = false;
  disabled: boolean = false;
  
  onAdd(tagify: {tags: TagData[], added: TagData}) {
    console.log('Added a tag', tagify);  
  }
  
  onRemove(tags: TagData[]) {
    console.log('Removed a tag', tags);
  }
}
