import { AfterViewInit, Component, inject, input, Type, ViewChild, WritableSignal, Injector, ChangeDetectorRef, InputSignal, Signal, effect } from '@angular/core';

import { Image } from '../../../style/models/image';
import { Style } from '../../../style/models/style';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { CardFaceImageEditorComponent } from '../card-face-image-editor/card-face-image-editor.component';
import { CardFaceRteComponent } from '../card-face-rte/card-face-rte.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FormsModule } from '@angular/forms';
import { CardApiService } from '../../services/card-game-core/api/card-api.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { CardEditorPreviewComponent } from '../card-editor-preview/card-editor-preview.component';
import { CardEditorControlsDesignComponent } from '../card-editor-controls-design/card-editor-controls-design.component';
import { CardEditorControlsDesignImageService } from '../../services/card-editor-controls-design-image.service';
import { CardEditorCloseComponent } from '../card-editor-close/card-editor-close.component';

// TODO: Resizable card face, have arrows for dragging, make sure there's a max width/height for that card face
@Component({
  selector: 'app-card-editor',
  imports: [
    AngularEditorModule, FormsModule,
    CommonModule, NgComponentOutlet,
    CardEditorPreviewComponent, CardEditorControlsDesignComponent,
    CardEditorCloseComponent
  ], // TODO: Remove CdkDrag
  templateUrl: './card-editor.component.html',
  styleUrl: './card-editor.component.css'
})
export class CardEditorComponent implements AfterViewInit {
  // https://www.youtube.com/watch?v=5JcMras7aaA
  private readonly cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  private readonly cardApiService: CardApiService = inject(CardApiService);

  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);

  constructor() {
    this.onEnableImageEditor();
    this.onDisableImageEditor();
  }

  ngAfterViewInit(): void {

  }

  isCurrentPopupMenuOpen: boolean = false;
  // TODO: Fix this, this should be for the card face image editor? Why is popup menu opening card face image?
  popupMenuInputs = {
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
  /*
  We have Angular 19 and still is not possible to subscribe to output events, but there are two strategies to handle output events when using ngComponentOutlet:

  1. Inject a function using ngComponentOutletInjector and handle the behavior outside the component:
  2) Get a reference to the component using ViewChild.
  */
  /*popupMenuInjector: Injector = Injector.create({
    providers: [
      {
        // TODO: Rewrite, no need for this boolean
        provide: CLOSE_IMAGE_EDITOR_TOKEN,
        useValue: (showImageEditor: boolean) => this.onCloseImageEditor(showImageEditor)
      },
      {
        provide: CROPPED_IMAGE_TOKEN,
        useValue: (croppedImage: string) => this.setCardFaceImageElementSrc(croppedImage)
      },
      {
        provide: RTE_HTML_CONTENT,
        useValue: (htmlContent: string) => this.setRteHtmlContent(htmlContent)
      }
    ]
  });*/

  // initialPosition: DndPosition = {x: 0, y: 0};

  // TODO: Use ngx-color-picker for picking colors on the card face

  private currentPopupMenu: number | null = 0;

  // Open the popup menu
  // TODO: Instead of using outlets and injectors, we should be using services
  getCurrentPopupMenuComponent(): Type<any> | null {
    switch (this.currentPopupMenu) {
      case 0:
        return CardFaceImageEditorComponent; // TODO: Replace with CardFaceImageEditor
      case 1:
        return CardFaceRteComponent;
      default: // CHECKME: Would this break the page
        return null;
    }
  }

  onEnableImageEditor() {
    this.cardEditorControlsDesignImageService.onEnableImageEditor$.subscribe(() => {
      this.currentPopupMenu = 0;
      this.isCurrentPopupMenuOpen = true;
    })
  }

  onDisableImageEditor() {
    this.cardEditorControlsDesignImageService.onDisableImageEditor$.subscribe((src: string) => {
      this.isCurrentPopupMenuOpen = false;
    })
  }

    // https://stackblitz.com/edit/angular-html2canvas-example-xfgxcv?file=src%2Fapp%2Fapp.component.ts
        // https://prasanthj.com/javascript/convet-div-to-image-in-angular/
        // https://stackblitz.com/edit/angular-html2canvas-example?file=src%2Fapp%2Fapp.component.ts

        // https://stackoverflow.com/questions/9664474/convert-blob-string-to-jpg-file/9664621

        // document.body.appendChild(canvas);

  // https://stackoverflow.com/questions/76188415/vue3-vite-module-has-been-externalized
}
