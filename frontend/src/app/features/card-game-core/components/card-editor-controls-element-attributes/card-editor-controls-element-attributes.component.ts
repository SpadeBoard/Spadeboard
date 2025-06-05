import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { CardEditorControlsElementLayeringAttributesComponent } from '../card-editor-controls-element-layering-attributes/card-editor-controls-element-layering-attributes.component';

@Component({
  selector: 'app-card-editor-controls-element-attributes',
  imports: [FormsModule, CardEditorControlsElementLayeringAttributesComponent],
  templateUrl: './card-editor-controls-element-attributes.component.html',
  styleUrl: './card-editor-controls-element-attributes.component.css'
})
export class CardEditorControlsElementAttributesComponent {
  readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  get height(): number {
    return this.cardEditorControlsDesignElementAttributesService.dimensions.height;
  }

  get width(): number {
    return this.cardEditorControlsDesignElementAttributesService.dimensions.width;
  }

  get x(): number {
    return this.cardEditorControlsDesignElementAttributesService.coordinates.x;
  }

  get y(): number {
    return this.cardEditorControlsDesignElementAttributesService.coordinates.y;
  }

  set height(height: number) {
    this.cardEditorControlsDesignElementAttributesService.dimensions.height = height;
    this.cardEditorControlsDesignElementAttributesService.setHeight(height);
  }

  set width(width: number) {
    this.cardEditorControlsDesignElementAttributesService.dimensions.width = width;
    this.cardEditorControlsDesignElementAttributesService.setWidth(width);
  }

  set x(x: number) {
    this.cardEditorControlsDesignElementAttributesService.coordinates.x = x;
    this.cardEditorControlsDesignElementAttributesService.setX(x);
  }

  set y(y: number) {
    this.cardEditorControlsDesignElementAttributesService.coordinates.y = y;
    this.cardEditorControlsDesignElementAttributesService.setY(y);
  }

  constructor() {
  }
}
