import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, InputSignal, output, OutputEmitterRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Coordinates, Dimensions, Threshold } from '../../../../utils/utils';
import { ResizableWrapperComponent } from '../../../resizable/components/resizable-wrapper/resizable-wrapper.component';
import { Style } from '../../../style/models/style';
import { CardFaceElementPerCardFace } from '../../models/card-face-element';
import { CardEditorControlsDesignImageService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/card-editor-controls-design-image.service';
import { CardEditorControlsDesignRteService } from '../../services/card-game-core/card-editor/controls/design/card-face-elements/card-editor-controls-design-rte.service';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardFaceElementService } from '../../services/card-game-core/card-face-element/card-face-element.service';
import { CardFaceElementDndService } from '../../services/card-game-core/card-face-element/dnd/card-face-element-dnd.service';
import { CardFaceElementImageService } from '../../services/card-game-core/card-face-element/images/card-face-element-image.service';
import { CardFaceElementRtService } from '../../services/card-game-core/card-face-element/rt/card-face-element-rt.service';
import { DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID, MAX_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { CardEditorElementDeleteButtonComponent } from '../card-editor-element-delete-button/card-editor-element-delete-button.component';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';
import { CardFaceRtComponent } from '../card-face-rt/card-face-rt.component';

@Component({
  selector: 'app-card-editor-current-card-face-elements-per-card-face',
  imports: [CdkDrag, DragDropModule, CardFaceImageComponent,
    CommonModule, CardFaceRtComponent, ResizableWrapperComponent, CardEditorElementDeleteButtonComponent],
  templateUrl: './card-editor-current-card-face-elements-per-card-face.component.html',
  styleUrl: './card-editor-current-card-face-elements-per-card-face.component.scss'
})
export class CardEditorCurrentCardFaceElementsPerCardFaceComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardFaceElementService: CardFaceElementService = inject(CardFaceElementService);

  private readonly cardFaceElementDndService:  CardFaceElementDndService = inject(CardFaceElementDndService);

  private readonly cardFaceElementRtService: CardFaceElementRtService = inject(CardFaceElementRtService);
  private readonly cardFaceElementImageService: CardFaceElementImageService = inject(CardFaceElementImageService);

  private readonly cardEditorControlsDesignRteService: CardEditorControlsDesignRteService = inject(CardEditorControlsDesignRteService);
  private readonly cardEditorControlsDesignImageService: CardEditorControlsDesignImageService = inject(CardEditorControlsDesignImageService);

  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;

  public readonly cardFaceBorderRadius: InputSignal<number> = input<number>(DEFAULT_CARD_FACE_BORDER_RADIUS);

  public readonly setElementAttributes: OutputEmitterRef<string> = output<string>();

  public readonly setElementDimensions: OutputEmitterRef<Dimensions> = output<Dimensions>();

  public readonly setElementPosition: OutputEmitterRef<Coordinates> = output<Coordinates>();

  public readonly createdCardFaceElementPerCardFace: OutputEmitterRef<{
    relative: { absolute: Coordinates; rect: DOMRect };
    type: string;
  }> = output<{ relative: { absolute: Coordinates; rect: DOMRect }; type: string }>();

  private dragOffset: Coordinates = { x: 0, y: 0 };

  private mousePosition: Coordinates = { x: 0, y: 0 };

  public readonly $cardFaceElementId: InputSignal<string> = input<string>(DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

  public readonly $cardFaceElementsPerCardFace: InputSignal<CardFaceElementPerCardFace[]> = input<CardFaceElementPerCardFace[]>([]);

  public readonly $shouldSnapToGrid: InputSignal<boolean> = input<boolean>(false);

  protected getCardFaceElementContainer(): Omit<Style, 'styleId'> {
    return {
      width: `100%`,
      height: `100%`,
      borderRadius: `${this.cardFaceBorderRadius()}px`
    }
  }

  protected getCardEditorFaceStyle(): Omit<Style, 'styleId'> {
    return this.cardEditorPreviewService.getCurrentCardFace().style;
  }

  public getCardFaceClientRect(): DOMRect {
    if (!this.cardEditorFace) {
      throw new Error('cardEditorFace is not available!');
    }

    return this.cardEditorFace.nativeElement.getBoundingClientRect();
  }

  constructor() {
  }

  protected getCardFaceElementDimensions(cardFaceElementPerCardFace: CardFaceElementPerCardFace): Dimensions {
    return this.cardFaceElementService.getCardFaceElementDimensions(cardFaceElementPerCardFace);
  }

  protected getCardFaceElementRt(cardFaceElementId: string): string {
    return this.cardFaceElementRtService.getRt(cardFaceElementId, this.$cardFaceElementsPerCardFace(), this.cardFaceElementService)
  }

  protected getCardFaceElementImageSrc(cardFaceElementId: string): string {
    return this.cardFaceElementImageService.getSrc(cardFaceElementId, this.$cardFaceElementsPerCardFace(), this.cardFaceElementService)
  }

  protected onDragStartMouseDown(event: MouseEvent): void {
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }

  protected onDragStarted(event: CdkDragStart<any>, cardFaceElementPerCardFace: CardFaceElementPerCardFace): void {
    if (!cardFaceElementPerCardFace) throw new Error("No currently edited card face element");

    let {x, y} = cardFaceElementPerCardFace.dndPosition;

    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.cardFaceElementDndService.setOffset(
      this.mousePosition,
      {x, y},
      this.getCardFaceClientRect(),
      this.dragOffset
    );
  }

  // TODO: Snapping should be immediate, so check here instead?
  protected onDragMoved(event: CdkDragMove<any>): void {

  }

  protected onDragDropped(event: CdkDragDrop<any>, cardFaceElementPerCardFace: CardFaceElementPerCardFace): void {
    let drop: Coordinates = {
      x: event.dropPoint.x,
      y: event.dropPoint.y,
    }

    let clamped: Coordinates = this.cardFaceElementDndService.getClampedCoordinates(drop, this.getCardFaceClientRect(), this.dragOffset, this.$shouldSnapToGrid(), this.cardFaceElementService.getCardFaceElementDimensions(cardFaceElementPerCardFace));

    // CHECKME: Is it possible that it's not updating correctly is because we're not updating the card face element ID that's being dragged.
    this.setElementPosition.emit(clamped);

    // FIXED: Sometimes it just doesn't update and I have no clue why, so this is here to try to force the rerender
    // and clamp the native element, force it to absolutely have a style
    // because for some reason, the element just lacked left and right after dragging it out of bounds twice
    let element: HTMLElement = event.item.element.nativeElement;
    element.style.left = `${clamped.x}px`;
    element.style.top = `${clamped.y}px`;

    // console.log(`On drag dropped - card face element ID: ${cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId}`);
  }

  protected enableRte(event: Event, cardFaceElementId: string): void {
    this.cardEditorControlsDesignRteService.setOnEnableRte(cardFaceElementId, this.getRt(cardFaceElementId));
  }

  protected disableRte(): void {
    // CHECKME: Unsubscribe from onRteTextChange here?
    if (!this.cardFaceElementRtService.isRt(this.$cardFaceElementId(), this.$cardFaceElementsPerCardFace(), this.cardFaceElementService)) return;

    this.cardEditorControlsDesignRteService.setOnDisableRte(this.$cardFaceElementId(), this.getRt(this.$cardFaceElementId()));
  }

  private getRt(cardFaceElementId: string): string {
    return this.cardFaceElementRtService.getRt(cardFaceElementId, this.$cardFaceElementsPerCardFace(), this.cardFaceElementService) ?? "";
  }

  protected focusImage(cardFaceElementId: string): void {
    this.disableRte();
    this.setElementAttributes.emit(cardFaceElementId);
  }

  protected enableImageEditor(cardFaceElementId: string): void {
    this.disableRte();
    this.cardEditorControlsDesignImageService.setOnEnableImageEditor(cardFaceElementId);
  }

  // TODO: Rework this, because cards have different max widths and heights
  protected getResizeThreshold(): Threshold {
    return {
      min: MIN_CARD_FACE_WIDTH,
      max: MAX_CARD_FACE_HEIGHT
    }
  }

  protected onResizableChange(dimensions: Dimensions): void {
    this.setElementDimensions.emit(dimensions);
  }
}