import { Component, computed, effect, inject, input, InputSignal, Signal } from '@angular/core';
import { AngularEditorModule, AngularEditorConfig, UploadResponse } from '@kolkov/angular-editor';
import { Style } from '../../../style/models/style';
import { HttpClientModule, HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RTE_HTML_CONTENT } from '../../../../shared/tokens';
import { CardEditorControlsDesignRteService } from '../../services/card-editor-controls-design-rte.service';

@Component({
  selector: 'app-card-face-rte',
  imports: [
    AngularEditorModule, FormsModule, HttpClientModule  //, HttpClient, HttpRequest
  ],
  templateUrl: './card-face-rte.component.html',
  styleUrl: './card-face-rte.component.css'
})
export class CardFaceRteComponent {
  /*
  core.mjs:6673 ERROR NullInjectorError: R3InjectorError(Standalone[_GameRoomComponent])[_HttpClient -> _HttpClient -> _HttpClient]: 
  NullInjectorError: No provider for _HttpClient!
    at NullInjector.get (core.mjs:1652:21)
    at R3Injector.get (core.mjs:2176:27)
    at R3Injector.get (core.mjs:2176:27)
    at R3Injector.get (core.mjs:2176:27)
    at ChainedInjector.get (core.mjs:4733:32)
    at lookupTokenUsingModuleInjector (core.mjs:5076:31)
    at getOrCreateInjectable (core.mjs:5122:10)
    at ɵɵdirectiveInject (core.mjs:11938:17)
    at ɵɵinject (core.mjs:1114:40)
    at inject (core.mjs:1199:10)
handleError @ core.mjs:6673
Show 1 more frame
Show less
  */
  private http = inject(HttpClient);

   private cardEditorControlsDesignRteService: CardEditorControlsDesignRteService = inject(CardEditorControlsDesignRteService);

  htmlContent: string = '';
  isEditable: boolean = false;
  
  readonly isEditableInput: InputSignal<boolean | undefined> = input<boolean | undefined>(false);
  readonly htmlContentInput : InputSignal<string | undefined>= input<string | undefined>("");
  
  // rteHtmlContentInject: (htmlContent: string) => void  = inject(RTE_HTML_CONTENT);
  // TODO: Have an injector to pass back up the htmlContent

  constructor() {
    this.onEnableRte();
    this.onDisableRte();
    
    effect(() => {

      let html: string | undefined = this.htmlContentInput();

      // console.log('HTML input: ', html);

      if (html !== undefined && html !== '') {
        this.htmlContent = html;
        // console.log('HTML content: ', this.htmlContent);
      }
    });
  }

  // TODO: Have input for enabling toolbar, enabling editable
  // TODO: Use what's stored in the style to assign heights, etc. to the angularEditorConfig
  readonly angularEditorConfigInput : InputSignal<AngularEditorConfig| undefined>= input<AngularEditorConfig | undefined>(/*{
    // minHeight: '5rem',
    // maxHeight: '38rem',
    // minWidth: '5rem',
    // maxWidth: '15rem',
    // width: '15rem',
    // height: '38rem'
  }*/undefined);

  // When the style's input changes
  readonly angularEditorConfigComputed: Signal<AngularEditorConfig | undefined> = computed(() => {
    if (this.angularEditorConfigInput() === undefined)
      return undefined;

    return this.angularEditorConfigInput();
  });
  
  /*
  This function declaration defines an upload method that takes a File object as an argument and returns an Observable of HttpEvent<UploadResponse>. Let's break down each part of the syntax
upload:: This is the name of the function.
(file: File): This is the parameter list. It specifies that the function takes one parameter named file of type File.
: Observable<HttpEvent<UploadResponse>>: This is the return type annotation. It indicates that the function returns an Observable that emits HttpEvent objects of type UploadResponse.
=> { ... }: This is an arrow function syntax, defining the body of the function.
  */
  private uploadUrl = '/upload/to/';

  getAngularEditorConfig(): AngularEditorConfig {
    return {
      editable: this.isEditable,
      spellcheck: true,
      // height: '38rem', // Set desired height
      // minHeight: '5rem', // Set minimum height
      minHeight: '135px',
      height: '135px',
      maxHeight: '135px',
      // maxHeight: 
      // width:
      // minWidth: 
      enableToolbar: true,
      showToolbar: true,
      placeholder: (this.isEditable) ? 'Enter text here...' : '',
      sanitize: true,
      fonts: [
        { class: 'arial', name: 'Arial' },
        { class: 'times-new-roman', name: 'Times New Roman' },
        { class: 'calibri', name: 'Calibri' },
        { class: 'comic-sans-ms', name: 'Comic Sans MS' },
        { class: 'courier-new', name: 'Courier New' },
        { class: 'georgia', name: 'Georgia' },
        { class: 'helvetica', name: 'Helvetica' },
        { class: 'impact', name: 'Impact' },
        { class: 'lucida-console', name: 'Lucida Console' },
        { class: 'tahoma', name: 'Tahoma' },
        { class: 'trebuchet-ms', name: 'Trebuchet MS' },
        { class: 'verdana', name: 'Verdana' },
        { class: 'roboto', name: 'Roboto' },
      ],
      uploadUrl: 'v1/image',
      upload: (file: File): Observable<HttpEvent<UploadResponse>> => {
        // FIXME: Actually return the object of this type
        let request = new HttpRequest('POST', this.uploadUrl, {
          reportProgress: true,
          observe: 'events' // Receive all HTTP events
        });

        return this.http.request<UploadResponse>(request);
      },
      uploadWithCredentials: false,
      toolbarHiddenButtons: [
        ['youtube', 'insertImage', 'insertVideo', 'link'] // TODO: Hide other buttons if needed
      ],
    }
  }

  onEnableRte() {
    this.cardEditorControlsDesignRteService.onEnableRte$.subscribe((text: string) => {
      this.isEditable = true;
      this.htmlContent = text;
    })
  }

  // TODO: Make a disable rte editor too?

  onDisableRte() {
    this.cardEditorControlsDesignRteService.onDisableRte$.subscribe(() => {
      this.isEditable = false;
    })
  }

  onContentChange(updatedHtml: string) {
    // Your logic here
    console.log('Editor content changed:', updatedHtml);

    this.cardEditorControlsDesignRteService.setOnRteTextChange(updatedHtml);
  }
}
