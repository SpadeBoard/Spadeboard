import { Component, inject, Type } from '@angular/core';

import { CommonModule, NgComponentOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { Image } from '../../../style/models/image';
import { Style } from '../../../style/models/style';
import { CardEditorControlsDesignImageService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/card-editor-controls-design-image.service';
import { CardEditorCloseComponent } from '../card-editor-close/card-editor-close.component';
import { CardEditorControlsDesignComponent } from '../card-editor-controls-design/card-editor-controls-design.component';
import { CardEditorPreviewComponent } from '../card-editor-preview/card-editor-preview.component';
import { CardFaceImageEditorComponent } from '../card-face-image-editor/card-face-image-editor.component';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';
import { CardEditorInfoComponent } from '../card-editor-info/card-editor-info.component';

// TODO: Resizable card face, have arrows for dragging, make sure there's a max width/height for that card face
@Component({
  selector: 'app-card-editor',
  imports: [
    AngularEditorModule, FormsModule,
    CommonModule, NgComponentOutlet,
    CardEditorPreviewComponent, CardEditorControlsDesignComponent,
    CardEditorCloseComponent, CardEditorInfoComponent
  ], // TODO: Remove CdkDrag
  templateUrl: './card-editor.component.html',
  styleUrl: './card-editor.component.scss'
})
export class CardEditorComponent{
  // https://www.youtube.com/watch?v=5JcMras7aaA

  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);
  
   private imageEditorStatusOperations: Map<string, Function> = new Map<string, Function>([
    ['enable', (id: string) => this.enableImageEditor(id)],
    ['disable', (src: string) => this.disableImageEditor(src)]
  ]);

  constructor() {
    this.onImageEditorStatusToggle();
  }

  public isCurrentPopupMenuOpen: boolean = false;

  // TODO: Fix this, this should be for the card face image editor? Why is popup menu opening card face image?
  public popupMenuInputs = {
    // TODO: Pass in the potential card face elements as well as front card face and back card face
    cardFaceImageAttr: {
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
    } as {
      cardFaceImage: Image;
      cardFaceImageStyle: Style;
    },
    //htmlContentInput: ''
  };

  // REFERENCE for ngComponentOutlet 'outputs': https://stackoverflow.com/a/79401383
  private currentPopupMenu: number | null = 0;

  // Open the popup menu
  // TODO: Instead of using outlets and injectors, we should be using services
  protected getCurrentPopupMenuComponent(): Type<any> | null {
    switch (this.currentPopupMenu) {
      case 0:
        return CardFaceImageEditorComponent; // TODO: Replace with CardFaceImageEditor
      case 1:
        return CardFaceRteComponent;
      default: // CHECKME: Would this break the page
        return null;
    }
  }

  private enableImageEditor(id: string): void {
    this.currentPopupMenu = 0;
    this.isCurrentPopupMenuOpen = true;
  }

  private disableImageEditor(src: string): void {
    this.isCurrentPopupMenuOpen = false;
  }

  private onImageEditorStatusToggle(): void {
    this.cardEditorControlsDesignImageService.onStatusToggle(this.imageEditorStatusOperations);
  }

  // https://stackblitz.com/edit/angular-html2canvas-example-xfgxcv?file=src%2Fapp%2Fapp.component.ts
  // https://prasanthj.com/javascript/convet-div-to-image-in-angular/
  // https://stackblitz.com/edit/angular-html2canvas-example?file=src%2Fapp%2Fapp.component.ts

  // https://stackoverflow.com/questions/9664474/convert-blob-string-to-jpg-file/9664621

  // document.body.appendChild(canvas);

  // https://stackoverflow.com/questions/76188415/vue3-vite-module-has-been-externalized
}
