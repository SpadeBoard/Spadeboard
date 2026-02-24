import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Component, DestroyRef, inject, SecurityContext } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularEditorConfig, AngularEditorModule, UploadResponse } from '@kolkov/angular-editor';
import { NgDompurifySanitizer, SANITIZE_STYLE, SanitizeStyle } from '@taiga-ui/dompurify';
import { Observable } from 'rxjs';
import { CardFaceElementRteService } from '../service/card-face-element-rte.service';
import { sanitizeStyle } from '../../../../../utils/rich-text-sanitizer.utils';

//https://chatgpt.com/share/6876a274-c9a0-800c-9689-87fe5a17b19f
// https://angular.dev/api/platform-browser/DomSanitizer

@Component({
  selector: 'app-card-face-element-rte',
  imports: [
    AngularEditorModule, FormsModule
  ],
  templateUrl: './card-face-element-rte.component.html',
  styleUrl: './card-face-element-rte.component.scss',
  providers: [
    {
      provide: SANITIZE_STYLE,
      useValue: sanitizeStyle
    }
  ]
})
export class CardFaceElementRteComponent {
  private readonly http: HttpClient = inject<HttpClient>(HttpClient);

  private readonly cardFaceElementRteService: CardFaceElementRteService = inject<CardFaceElementRteService>(CardFaceElementRteService);

  private readonly dompurifySanitizer: NgDompurifySanitizer = inject<NgDompurifySanitizer>(NgDompurifySanitizer);
  
  private readonly sanitizeStyle: SanitizeStyle = inject<SanitizeStyle>(SANITIZE_STYLE);

  protected htmlContent: string = '';

  protected isEditable: boolean = false;

  private readonly destroyRef: DestroyRef = inject<DestroyRef>(DestroyRef);
  
  // rteHtmlContentInject: (htmlContent: string) => void  = inject(RTE_HTML_CONTENT);
  // TODO: Have an injector to pass back up the htmlContent

  constructor() {
    this.rteStatusToggle();
  }

  // TODO: Have input for enabling toolbar, enabling editable
  // TODO: Use what's stored in the style to assign heights, etc. to the angularEditorConfig

  private rteStatusOperations: Map<string, Function> = new Map<string, Function>([
    ['enable', (emitted: {id: string, text: string}) => this.enableRte(emitted)],
    ['disable', (emitted: {id: string, text: string}) => this.disableRte(emitted)]
  ]);
  
  /*
  This function declaration defines an upload method that takes a File object as an argument and returns an Observable of HttpEvent<UploadResponse>. Let's break down each part of the syntax
upload:: This is the name of the function.
(file: File): This is the parameter list. It specifies that the function takes one parameter named file of type File.
: Observable<HttpEvent<UploadResponse>>: This is the return type annotation. It indicates that the function returns an Observable that emits HttpEvent objects of type UploadResponse.
=> { ... }: This is an arrow function syntax, defining the body of the function.
  */
  private uploadUrl: string = '/upload/to/';

  protected angularEditorConfig(): AngularEditorConfig {
    return  {
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
      sanitize: false, // NOTE: use DOMPurify & onvert to BBCode to sanitise it
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

  private rteStatusToggle(): void {
    this.cardFaceElementRteService.statusToggleSubscription(this.rteStatusOperations, this.destroyRef);
  }

  private enableRte(emitted: {id: string, text: string}): void {
    this.isEditable = true;
    this.htmlContent = emitted.text;
  }

  private disableRte(emitted: {id: string, text: string}): void {
    this.isEditable = false;
  }

  protected onContentChange(updatedHtml: string): void {
    // NOTE: We want to sanitize the style too because we're saving it to the database
    updatedHtml = this.sanitizeStyle(updatedHtml);
    // https://medium.com/angular-in-depth/warning-sanitizing-html-stripped-some-content-and-how-to-deal-with-it-properly-10ff77012d5a
    updatedHtml = this.dompurifySanitizer.sanitize(SecurityContext.HTML, updatedHtml);
    
    this.cardFaceElementRteService.setRteTextChange(updatedHtml);
  }
}
