import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';

import { Component, ElementRef, inject, input, InputSignal, output, OutputEmitterRef, ViewChild } from '@angular/core';
import { Coordinates, Dimensions, Threshold } from '../../../../utils/utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { ResizableWrapperComponent } from '../../../resizable/components/resizable-wrapper/resizable-wrapper.component';
import { Style } from '../../../style/models/style';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardFaceElementDndService } from '../../services/card-game-core/card-face-element/dnd/card-face-element-dnd.service';
import { CardFaceElementImageService } from '../../services/card-game-core/card-face-element/images/card-face-element-image.service';
import { DEFAULT_CARD_FACE_BORDER_RADIUS, DEFAULT_CARD_FACE_ELEMENT_POSITION, DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID, MAX_CARD_FACE_HEIGHT, MIN_CARD_FACE_WIDTH } from '../../utils/card-editor.constants';
import { DEFAULT_CARD_FACE_ELEMENTDIMENSIONS } from '../../utils/card-face-element.constants';
import { CardEditorElementDeleteButtonComponent } from '../card-editor-element-delete-button/card-editor-element-delete-button.component';
import { CardFaceImageComponent } from '../card-face-image/card-face-image.component';
import { CardFaceRtComponent } from '../card-face-rt/card-face-rt.component';

@Component({
  selector: 'app-card-editor-current-card-face-elements-per-card-face',
  imports: [CdkDrag, DragDropModule, CardFaceImageComponent, CardFaceRtComponent, ResizableWrapperComponent, CardEditorElementDeleteButtonComponent],
  templateUrl: './card-editor-current-card-face-elements-per-card-face.component.html',
  styleUrl: './card-editor-current-card-face-elements-per-card-face.component.scss'
})
export class CardEditorCurrentCardFaceElementsPerCardFaceComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardFaceElementDndService: CardFaceElementDndService = inject(CardFaceElementDndService);

  private readonly cardFaceElementImageService: CardFaceElementImageService = inject(CardFaceElementImageService);

  @ViewChild('cardEditorFace') cardEditorFace!: ElementRef;

  public readonly $cardFaceBorderRadius: InputSignal<number> = input<number>(DEFAULT_CARD_FACE_BORDER_RADIUS);

  public readonly $setElementAttributes: OutputEmitterRef<string> = output<string>();

  public readonly $setElementDimensions: OutputEmitterRef<Dimensions> = output<Dimensions>();

  public readonly $setElementPosition: OutputEmitterRef<Coordinates> = output<Coordinates>();

  private dragOffset: Coordinates = { x: 0, y: 0 };

  private mousePosition: Coordinates = { x: 0, y: 0 };

  public readonly $cardFaceElementId: InputSignal<string> = input<string>(DEFAULT_CURRENT_CARD_FACE_ELEMENT_ID);

  public readonly $shouldSnapToGrid: InputSignal<boolean> = input<boolean>(false);

  public readonly $enableRte: OutputEmitterRef<string> = output<string>();

  public readonly $focusImage: OutputEmitterRef<string> = output<string>();

  public readonly $enableImageEditor: OutputEmitterRef<string> = output<string>();

  public readonly $cardFaceElementRts: InputSignal<Map<string, string>> = input<Map<string, string>>(new Map<string, string>());

  public readonly $cardFaceElementImages: InputSignal<Map<string, string>> = input<Map<string, string>>(new Map<string, string>());

  // TODO: Replace $cardFaceElementsPerCardFace with this since it's smaller
  public readonly $cardFaceElementIdentifiers: InputSignal<{
    cardFaceElementId: string,
    cardFaceElementType: 'Rt' | 'Image',
    cardFaceElementZIndex: string,
    cardFaceElementPerCardFaceId: string // TODO: Take this out
  }[]> = input<{
    cardFaceElementId: string,
    cardFaceElementType: 'Rt' | 'Image',
    cardFaceElementZIndex: string,
    cardFaceElementPerCardFaceId: string // TODO: Take this out
  }[]>([]);

  public readonly $cardFaceElementPositions: InputSignal<Map<string, Coordinates>> = input<Map<string, Coordinates>>(new Map<string, DndPosition>());

  public readonly $cardFaceElementDimensions: InputSignal<Map<string, Dimensions>> = input<Map<string, Dimensions>>(new Map<string, Dimensions>());

  protected getCardFaceElementContainer(): Omit<Style, 'styleId'> {
    return {
      width: `100%`,
      height: `100%`,
      borderRadius: `${this.$cardFaceBorderRadius()}px`
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

  constructor() {}

  protected getCardFaceElementDimensions(cardFaceElementId: string): Dimensions {
    return this.$cardFaceElementDimensions().get(cardFaceElementId) ?? DEFAULT_CARD_FACE_ELEMENTDIMENSIONS;
  }

  protected getCardFaceElementPosition(cardFaceElementId: string): Omit<DndPosition, 'dndPositionId'> {
    return this.$cardFaceElementPositions().get(cardFaceElementId) ?? DEFAULT_CARD_FACE_ELEMENT_POSITION;
  }

  protected getCardFaceElementRt(cardFaceElementId: string): string {
    return this.$cardFaceElementRts().get(cardFaceElementId) ?? '';
  }

  // TODO: Replace with getting inside the map
  protected getCardFaceElementImageSrc(cardFaceElementId: string): string {
    return this.$cardFaceElementImages().get(cardFaceElementId) ?? this.cardFaceElementImageService.PLACEHOLDER_IMAGE_SRC;
  }

  protected onDragStartMouseDown(event: MouseEvent): void {
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }

  protected onDragStarted(event: CdkDragStart<any>, cardFaceElementId: string): void {
    let { x, y } = this.getCardFaceElementPosition(cardFaceElementId);

    // NOTE: This is because unless you click at the top left of the item, there'll always be an offset
    this.cardFaceElementDndService.setOffset(
      this.mousePosition,
      { x, y },
      this.getCardFaceClientRect(),
      this.dragOffset
    );
  }

  // TODO: Snapping should be immediate, so check here instead?
  protected onDragMoved(event: CdkDragMove<any>): void {

  }

  protected onDragDropped(event: CdkDragDrop<any>, cardFaceElementId: string): void {
    let drop: Coordinates = {
      x: event.dropPoint.x,
      y: event.dropPoint.y,
    }

    let clamped: Coordinates = this.cardFaceElementDndService.getClampedCoordinates(drop, this.getCardFaceClientRect(), this.dragOffset, this.$shouldSnapToGrid(), this.getCardFaceElementDimensions(cardFaceElementId));

    // CHECKME: Is it possible that it's not updating correctly is because we're not updating the card face element ID that's being dragged.
    this.$setElementPosition.emit(clamped);

    // FIXED: Sometimes it just doesn't update and I have no clue why, so this is here to try to force the rerender
    // and clamp the native element, force it to absolutely have a style
    // because for some reason, the element just lacked left and right after dragging it out of bounds twice
    let element: HTMLElement = event.item.element.nativeElement;
    element.style.left = `${clamped.x}px`;
    element.style.top = `${clamped.y}px`;

    // console.log(`On drag dropped - card face element ID: ${cardFaceElementPerCardFace.cardFaceElement.cardFaceElementId}`);
  }

  protected enableRte(event: Event, cardFaceElementId: string): void {
    this.$enableRte.emit(cardFaceElementId);
  }

  protected focusImage(cardFaceElementId: string): void {
    this.$focusImage.emit(cardFaceElementId);
  }

  protected enableImageEditor(cardFaceElementId: string): void {
    this.$enableImageEditor.emit(cardFaceElementId);
  }

  // TODO: Rework this, because cards have different max widths and heights
  protected getResizeThreshold(): Threshold {
    return {
      min: MIN_CARD_FACE_WIDTH,
      max: MAX_CARD_FACE_HEIGHT
    }
  }

  protected onResizableChange(dimensions: Dimensions): void {
    this.$setElementDimensions.emit(dimensions);
  }
}