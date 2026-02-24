import { Component, input, InputSignal, model, ModelSignal, output, OutputEmitterRef } from '@angular/core';
import { DndPosition } from '../../../../drag-and-drop/models/dnd-position';
import { BorderDimensions } from '../../../../style/models/style';
import { CardFaceElementsLibraryComponent } from '../../../card-face-element/components/library/card-face-elements-library.component';
import { CardFaceElementRteComponent } from '../../../card-face-element/components/subtypes/rich-text-editor/component/card-face-element-rte.component';
import { Card } from '../../../card/models/card';
import { CardFaceElementControlsComponent } from '../card-face-element/card-face-element-controls.component';
import { CardFaceControlsComponent } from '../card-face/core/card-face-controls.component';
import { CardTemplatesComponent } from '../../components/templates/card-templates.component';
import { DEFAULT_CARD_FACE_BACKGROUND_COLOR, DEFAULT_CARD_FACE_BORDER_COLOR, DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CARD_FACE_BORDER_WIDTH, DEFAULT_CARD_FACE_HEIGHT, DEFAULT_CARD_FACE_WIDTH, MAX_CARD_FACE_HEIGHT, MAX_CARD_FACE_WIDTH } from '../../constants/card-editor.constants';

@Component({
  selector: 'app-card-editor-controls',
  imports: [
    CardTemplatesComponent,
    CardFaceElementsLibraryComponent,
    CardFaceElementRteComponent,
    CardFaceElementControlsComponent,
    CardFaceControlsComponent
  ],
  templateUrl: './card-editor-controls.component.html',
  styleUrl: './card-editor-controls.component.scss'
})
export class CardEditorControlsComponent {
  public readonly $currentEditedCardId: InputSignal<string> = input<string>('');

  public readonly $selectCard: OutputEmitterRef<string> = output<string>();

  public readonly $deleteCard: OutputEmitterRef<string> = output<string>();

  public readonly $cardTemplates: InputSignal<Card[]> = input<Card[]>([]);

  public readonly $collectionContextCardId: OutputEmitterRef<string> = output<string>();

  public readonly $toggleContextMenu: OutputEmitterRef<{
    event: MouseEvent,
    menu: 'Preview' | 'Templates'
  }> = output<{
    event: MouseEvent,
    menu: 'Preview' | 'Templates'
  }>();

  public readonly $cardFaceElementsPerCardFaceAmt: InputSignal<number> = input<number>(0);

  public readonly $isCardFaceElementsLibraryDisabled: InputSignal<boolean> = input<boolean>(false);

  public readonly $createdCardFaceElementPerCardFace: OutputEmitterRef<{
    type: string,
    dndPosition: DndPosition
  }> = output<{
    type: string,
    dndPosition: DndPosition
  }>();

  public readonly $cardFaceAttributesId: InputSignal<string> = input<string>('');

  public readonly $areBorderDimensionsEqual: InputSignal<boolean> = input<boolean>(false);

  public $cardFaceHexcode: ModelSignal<string> = model<string>(DEFAULT_CARD_FACE_BACKGROUND_COLOR);

  public $borderHexcode: ModelSignal<string> = model<string>(DEFAULT_CARD_FACE_BORDER_COLOR);

  public $borderRadius: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_BORDER_RADIUS);

  public $cardFaceWidth: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_WIDTH);

  public $cardFaceHeight: ModelSignal<number> = model<number>(DEFAULT_CARD_FACE_HEIGHT);

  public $borderDimensions: ModelSignal<BorderDimensions> = model<BorderDimensions>({
    borderWidth: DEFAULT_CARD_FACE_BORDER_WIDTH,
    borderRect: {
      top: DEFAULT_CARD_FACE_BORDER_WIDTH,
      bottom: DEFAULT_CARD_FACE_BORDER_WIDTH,
      left: DEFAULT_CARD_FACE_BORDER_WIDTH,
      right: DEFAULT_CARD_FACE_BORDER_WIDTH
    }
  });

  public readonly $currentCardFaceElementId: InputSignal<string> = input<string>('');

  public $cardFaceElementWidth: ModelSignal<number> = model<number>(0);

  public $cardFaceElementHeight: ModelSignal<number> = model<number>(0);

  public $cardFaceElementX: ModelSignal<number> = model<number>(0);

  public $cardFaceElementY: ModelSignal<number> = model<number>(0);

  public readonly $maxCardFaceElementWidth: InputSignal<number> = input<number>(MAX_CARD_FACE_WIDTH);

  public readonly $maxCardFaceElementHeight: InputSignal<number> = input<number>(MAX_CARD_FACE_HEIGHT);

  public readonly $maxCardFaceElementX: InputSignal<number> = input<number>(MAX_CARD_FACE_WIDTH);

  public readonly $maxCardFaceElementY: InputSignal<number> = input<number>(MAX_CARD_FACE_HEIGHT);

  public readonly $setLayeringOperation: OutputEmitterRef<'front' | 'back' | 'forward' | 'backward'> = output<'front' | 'back' | 'forward' | 'backward'>();

  public readonly $editable: InputSignal<boolean> = input<boolean>(true); 

  public readonly $aspectRatioLocked: ModelSignal<boolean> = model<boolean>(true);

  protected selectCard(cardId: string): void {
    this.$selectCard.emit(cardId);
  }

  protected deleteCard(cardId: string): void {
    this.$deleteCard.emit(cardId);
  }

  protected setCollectionContextCardId(cardId: string): void {
    this.$collectionContextCardId.emit(cardId);
  }

  protected toggleContextMenu(info: { event: MouseEvent, menu: 'Preview' | 'Templates' }): void {
    this.$toggleContextMenu.emit(info);
  }

  protected createdCardFaceElementPerCardFace(info: { type: string, dndPosition: DndPosition }): void {
    this.$createdCardFaceElementPerCardFace.emit(info);
  }

  protected setLayeringOperation(operation: 'front' | 'back' | 'forward' | 'backward'): void {
    this.$setLayeringOperation.emit(operation);
  }
}
