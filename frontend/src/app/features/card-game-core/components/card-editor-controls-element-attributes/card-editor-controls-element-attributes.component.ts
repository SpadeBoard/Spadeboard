import { Component, effect, inject } from '@angular/core';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';

@Component({
  selector: 'app-card-editor-controls-element-attributes',
  imports: [],
  templateUrl: './card-editor-controls-element-attributes.component.html',
  styleUrl: './card-editor-controls-element-attributes.component.css'
})
export class CardEditorControlsElementAttributesComponent {
  private readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);
  
  currentElementId: string = "";

  constructor() {
    effect(() => {
      if (this.cardEditorControlsDesignElementAttributesService.currentCardFaceElementId() > -1) {
        this.currentElementId = `${this.cardEditorControlsDesignElementAttributesService.currentCardFaceElementId()}`;
      }
    })

    this.onSetWidth();
    this.onSetHeight();

    this.onSetX();
    this.onSetY();
  }

  onHeightChange(event: Event) {
    let height = (event.target as HTMLInputElement).value;
    this.cardEditorControlsDesignElementAttributesService.setHeight(parseFloat(height));
  }

  onWidthChange(event: Event) {
    let width = (event.target as HTMLInputElement).value;
    this.cardEditorControlsDesignElementAttributesService.setWidth(parseFloat(width));
  }

  onXChange(event: Event) {
    let x= (event.target as HTMLInputElement).value;
    this.cardEditorControlsDesignElementAttributesService.setX(parseFloat(x));
  }

  onYChange(event: Event) {
    let y = (event.target as HTMLInputElement).value;
    this.cardEditorControlsDesignElementAttributesService.setY(parseFloat(y));
  }

  onSetWidth(){
    this.cardEditorControlsDesignElementAttributesService.onSetWidth$.subscribe((width: number) => {
      (document.getElementById("width") as HTMLInputElement).value = `${width}`;
    })
  }

  onSetHeight() {
    this.cardEditorControlsDesignElementAttributesService.onSetHeight$.subscribe((height: number) => {
      (document.getElementById("height") as HTMLInputElement).value = `${height}`;
    })
  }

  onSetX(){
    this.cardEditorControlsDesignElementAttributesService.onSetX$.subscribe((x: number) => {
      (document.getElementById("x") as HTMLInputElement).value = `${x}`;
    })
  }

  onSetY() {
    this.cardEditorControlsDesignElementAttributesService.onSetY$.subscribe((y: number) => {
      (document.getElementById("y") as HTMLInputElement).value = `${y}`;
    })
  }
}
