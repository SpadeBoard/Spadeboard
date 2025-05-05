import { Component, effect, inject } from '@angular/core';
import { CardEditorControlsDesignElementAttributesService } from '../../services/card-editor-controls-design-element-attributes.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card-editor-controls-element-attributes',
  imports: [FormsModule],
  templateUrl: './card-editor-controls-element-attributes.component.html',
  styleUrl: './card-editor-controls-element-attributes.component.css'
})
export class CardEditorControlsElementAttributesComponent {
  readonly cardEditorControlsDesignElementAttributesService: CardEditorControlsDesignElementAttributesService = inject(CardEditorControlsDesignElementAttributesService);

  get height(): number {
    console.log(`Element attributes - Get Height`);
    return this.cardEditorControlsDesignElementAttributesService.height;
  }

  get width(): number {
    console.log(`Element attributes - Get Width`);
    return this.cardEditorControlsDesignElementAttributesService.width;
  }

  get x(): number {
    console.log(`Element attributes - Get X`);
    return this.cardEditorControlsDesignElementAttributesService.x;
  }

  get y(): number {
    console.log(`Element attributes - Get Y`);
    return this.cardEditorControlsDesignElementAttributesService.y;
  }

  set height(height: number) {
    console.log(`Element attributes - Set Height`);
    this.cardEditorControlsDesignElementAttributesService.height = height;
    this.cardEditorControlsDesignElementAttributesService.setHeight(height);
  }

  set width(width: number) {
    console.log(`Element attributes - Set Width`);
    this.cardEditorControlsDesignElementAttributesService.width = width;
    this.cardEditorControlsDesignElementAttributesService.setWidth(width);
  }

  set x(x: number) {
    console.log(`Element attributes - Set X`);
    this.cardEditorControlsDesignElementAttributesService.x = x;
    this.cardEditorControlsDesignElementAttributesService.setX(x);
  }

  set y(y: number) {
    console.log(`Element attributes - Set Y`);
    this.cardEditorControlsDesignElementAttributesService.y = y;
    this.cardEditorControlsDesignElementAttributesService.setY(y);
  }

  constructor() {
  }
}
