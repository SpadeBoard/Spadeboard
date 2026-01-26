import { DestroyRef, inject, Injectable } from '@angular/core';
import { BorderDimensions, Style } from '../../../../../../style/models/style';
import { DEFAULT_CARD_EDITOR_FACE_STYLE } from '../../../../../utils/card-editor.constants';
import { CardEditorControlsDesignCardFaceAttributesService } from '../../../card-editor/controls/design/card-face/card-editor-controls-design-card-face-attributes.service';
import { CardFaceStyleService } from '../../style/card-face-style.service';
import { CardEditorPreviewService } from '../../../card-editor/preview/card-editor-preview.service';

@Injectable({
  providedIn: 'root',
})
export class CardFaceEditorPreviewAttributesService {
  private readonly cardFaceStyleService: CardFaceStyleService = inject(CardFaceStyleService);

  private readonly cardEditorControlsDesignCardFaceAttributesService: CardEditorControlsDesignCardFaceAttributesService = inject(CardEditorControlsDesignCardFaceAttributesService);

  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  // CHECKME: Do we want this as a signal or just plain variable
  public currentCardFaceStyle: Style = {...DEFAULT_CARD_EDITOR_FACE_STYLE};

  public cardFaceColorOperations: Map<string, Function> = new Map<string, Function>([
    ['face', (color: string) => this.setColor(color, 'face', this.getCurrentCardFaceStyle())],
    ['edge', (color: string) => this.setColor(color, 'edge', this.getCurrentCardFaceStyle())]
  ]);

  public cardFaceDimensionsOperations: Map<string, Function> = new Map<string, Function>([
    ['w', (dimension: number) => this.setDimensions(dimension, 'w', this.getCurrentCardFaceStyle())],
    ['h', (dimension: number) => this.setDimensions(dimension, 'h', this.getCurrentCardFaceStyle())]
  ]);

  public cardFaceBorderOperations: Map<string, Function> = new Map<string, Function>([
    ['radius', (radius: number) => this.cardFaceStyleService.setBorderRadius(radius, this.getCurrentCardFaceStyle())],
    ['bd', (bd: BorderDimensions) => this.cardFaceStyleService.setDimensions(bd, this.getCurrentCardFaceStyle())]
  ]);

  public getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return { ...this.cardFaceStyleService.getStyle(this.getCurrentCardFaceStyle()), margin: 'auto' };
  }

  public getCurrentCardFaceStyle(): Style {
    return this.currentCardFaceStyle;
  }

  public setCurrentCardFaceStyle(style: Style): void {
    this.currentCardFaceStyle = { ...style };
  }

  public setCurrentCardFaceId(): void {
    this.cardEditorControlsDesignCardFaceAttributesService.setCurrentCardFaceId(this.cardEditorPreviewService.getCurrentCardFace().cardFaceId);
  }

  public setColor(
    color: string,
    operation: string,

    currentCardFaceStyle: Style,
  ): void {
    if (operation !== 'face' && operation !== 'edge') throw new Error("Set color operation has to be face or edge");

    this.cardFaceStyleService.setColor(color, currentCardFaceStyle, operation);
  }

  public setDimensions(
    dimension: number,
    operation: string,

    currentCardFaceStyle: Style
  ): void {
    if (operation !== 'w' && operation !== 'h') throw new Error("Set dimension operation has to be w or h");

    this.cardFaceStyleService.setDimensions(dimension, currentCardFaceStyle, operation);
  }

  public setCardFaceAppearanceAttributes(destroyRef: DestroyRef): void {
    this.cardEditorControlsDesignCardFaceAttributesService.cardFaceColorAttributes(this.cardFaceColorOperations, destroyRef);

    let setBorderRadius: Function | undefined = this.cardFaceBorderOperations.get('radius');
    let setBorderDimensions: Function | undefined = this.cardFaceBorderOperations.get('bd');

    if (setBorderRadius) this.cardEditorControlsDesignCardFaceAttributesService.borderRadiusChange((radius: number) => setBorderRadius(radius), destroyRef);
    if (setBorderDimensions) this.cardEditorControlsDesignCardFaceAttributesService.borderDimensionsChange((bd: BorderDimensions) => setBorderDimensions(bd), destroyRef);

    this.cardEditorControlsDesignCardFaceAttributesService.cardFaceDimensionsAttributes(this.cardFaceDimensionsOperations, destroyRef);
  }
}
