import { DestroyRef, inject, Injectable } from '@angular/core';
import { BorderDimensions, Style } from '../../../../../../style/models/style';
import { DEFAULT_CARD_EDITOR_FACE_STYLE } from '../../../../../card-editor/constants/card-editor.constants';
import { CardFaceAttributesControlsService } from '../../../card-editor/controls/design/card-face/card-face-attributes-controls.service';
import { CardFaceStyleService } from '../../style/card-face-style.service';

@Injectable({
  providedIn: 'root',
})
// CHECKME: Put this in the facade? And or merge with cardFaceAttributesControlsService
export class CardFaceEditorPreviewAttributesService {
  private readonly cardFaceStyleService: CardFaceStyleService = inject<CardFaceStyleService>(CardFaceStyleService);

  private readonly cardFaceAttributesControlsService: CardFaceAttributesControlsService = inject(CardFaceAttributesControlsService);

  // CHECKME: Do we want this as a signal or just plain variable
  public currentCardFaceStyle: Style = {...DEFAULT_CARD_EDITOR_FACE_STYLE};

  public cardFaceColorOperations: Map<string, Function> = new Map<string, Function>([
    ['face', (color: string) =>  this.cardFaceStyleService.setColor(color, this.getCurrentCardFaceStyle(), 'face')],
    ['edge', (color: string) => this.cardFaceStyleService.setColor(color, this.getCurrentCardFaceStyle(), 'edge')]
  ]);

  public cardFaceDimensionsOperations: Map<string, Function> = new Map<string, Function>([
    ['w', (dimension: number) => this.cardFaceStyleService.setDimensions(dimension, this.getCurrentCardFaceStyle(), 'w')],
    ['h', (dimension: number) => this.cardFaceStyleService.setDimensions(dimension, this.getCurrentCardFaceStyle(), 'h')]
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

  public setCardFaceAppearanceAttributes(destroyRef: DestroyRef): void {
    this.cardFaceAttributesControlsService.cardFaceColorAttributes(this.cardFaceColorOperations, destroyRef);

    let setBorderRadius: Function | undefined = this.cardFaceBorderOperations.get('radius');
    let setBorderDimensions: Function | undefined = this.cardFaceBorderOperations.get('bd');

    if (setBorderRadius) this.cardFaceAttributesControlsService.borderRadiusChange((radius: number) => setBorderRadius(radius), destroyRef);
    if (setBorderDimensions) this.cardFaceAttributesControlsService.borderDimensionsChange((bd: BorderDimensions) => setBorderDimensions(bd), destroyRef);

    this.cardFaceAttributesControlsService.cardFaceDimensionsAttributes(this.cardFaceDimensionsOperations, destroyRef);
  }
}
