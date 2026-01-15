import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CardEditorCloseComponent } from '../card-editor-close/card-editor-close.component';
import { CardEditorControlsDesignComponent } from '../card-editor-controls-design/card-editor-controls-design.component';
import { CardEditorInfoComponent } from '../card-editor-info/card-editor-info.component';
import { CardEditorPreviewComponent } from '../card-editor-preview/card-editor-preview.component';

// TODO: Resizable card face, have arrows for dragging, make sure there's a max width/height for that card face
@Component({
  selector: 'app-card-editor',
  imports: [
    AngularEditorModule,
    FormsModule,
    CommonModule,
    CardEditorPreviewComponent,
    CardEditorControlsDesignComponent,
    CardEditorCloseComponent,
    CardEditorInfoComponent
  ],
  templateUrl: './card-editor.component.html',
  styleUrl: './card-editor.component.scss'
})
export class CardEditorComponent {
  constructor() {
  }
}
