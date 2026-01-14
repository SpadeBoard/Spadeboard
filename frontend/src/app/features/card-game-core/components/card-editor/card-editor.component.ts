import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { Image } from '../../../style/models/image';
import { Style } from '../../../style/models/style';
import { CardEditorControlsDesignImageService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/card-editor-controls-design-image.service';
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
export class CardEditorComponent{
  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);
  
   private imageEditorStatusOperations: Map<string, Function> = new Map<string, Function>([
    ['enable', (id: string) => this.enableImageEditor(id)],
    ['disable', (src: string) => this.disableImageEditor(src)]
  ]);

  constructor() {
    this.onImageEditorStatusToggle();
  }

  private cardFaceImageAttr: {
    cardFaceImage: Image;
    cardFaceImageStyle: Style;
  } = {
      cardFaceImage: {
        imageId: 0,
        src: '',
        alt: ''
      },
      cardFaceImageStyle: {
        styleId: "0",
        width: '100',
        height: '150',
      }
    };

  // CHECKME: Potentially remove this?
  private enableImageEditor(id: string): void {
    this.cardEditorControlsDesignImageService.open(
      this.cardFaceImageAttr,
      this.cardEditorControlsDesignImageService.getStyle()
    )
  }

  // CHECKME: Potentially remove this?
  private disableImageEditor(src: string): void {
    // this.isCurrentPopupMenuOpen = false;
  }

  private onImageEditorStatusToggle(): void {
    this.cardEditorControlsDesignImageService.onStatusToggle(this.imageEditorStatusOperations);
  }
}
