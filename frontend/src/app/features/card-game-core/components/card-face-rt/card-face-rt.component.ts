import { Component, computed, effect, input, InputSignal, Signal } from '@angular/core';
import { bbCodeToHtml, html, decodeHtml } from '../../utils/rich-text-sanitizer.utils';
import { CardFaceElementDto } from '../../models/card-face-element';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-face-rt',
  imports: [AngularEditorModule, FormsModule,
      CommonModule],
  templateUrl: './card-face-rt.component.html',
  styleUrl: './card-face-rt.component.css'
})
export class CardFaceRtComponent {
  // https://dev.to/christiankohler/how-to-use-resizeobserver-with-angular-9l5

  // We grab the BBCode from the card face element
  content: InputSignal<string> = input<string>("");

  cardFaceRtWidth: InputSignal<number> = input<number>(0.01);
  cardFaceRtWidthComputed: Signal<string> = computed(() => `${this.cardFaceRtWidth()}px`);
  
  cardFaceRtHeight: InputSignal<number> = input<number>(0.01);
  cardFaceRtHeightComputed: Signal<string> = computed(() => `${this.cardFaceRtHeight()}px`);

  html: string = "";

  maxWidth: InputSignal<string> = input<string>("100%");
  maxHeight: InputSignal<string> = input<string>("100px");

  // TODO: Effect in constructor, check to make sure its type is rte
  constructor() {
    effect(() => {
      if (this.content() !== "") {
        this.html = this.content();
      }
    });
  }

  getAngularEditorConfig(): AngularEditorConfig {
    return {
      // Properties from AngularEditorConfig
      editable: false,
      spellcheck: false,
      height: this.cardFaceRtHeightComputed(),
      width: this.cardFaceRtWidthComputed(),
      minHeight: '20px',
      minWidth: '50px',
      maxHeight: this.maxHeight(),
      enableToolbar: false,
      showToolbar: false,
      outline: true
    }
  };

  // TODO: We have a card face element dto input

  // TODO: Pass in card face element content to bbCodeToHtml
  setHtmlContent(bbCode: string): void {
    this.html = bbCodeToHtml(bbCode);
  }

  /*setHtml(cardFaceElementDto: CardFaceElementDto): void {
    this.setHtmlContent(cardFaceElementDto.cardFaceElement.cardFaceElementContent);

    if (cardFaceElementDto.cardFaceElement.style === undefined)
      return;

  }*/

  getInnerHtml(): string | null {
    return decodeHtml(this.html);
  }

  onResize() {
    // TODO: Set the image width and height, call the element attributes service
  }

  // TODO: Create a style and grab the DndPosition
}
