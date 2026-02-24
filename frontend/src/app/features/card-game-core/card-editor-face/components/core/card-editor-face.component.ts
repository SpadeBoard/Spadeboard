import { DragDropModule } from '@angular/cdk/drag-drop';

import { AfterViewInit, Component, ElementRef, input, InputSignal, output, OutputEmitterRef, ViewChild } from '@angular/core';
import { GridComponent } from '../../../../../shared/grid/grid.component';
import { Coordinates, Dimensions } from '../../../../../utils/utils';
import { Style } from '../../../../style/models/style';
import { DEFAULT_CARD_FACE_BORDER_RADIUS } from '../../../card-editor/constants/card-editor.constants';
import { CardEditorCardFaceElementsComponent } from '../../../components/card-editor-card-face-elements/card-editor-card-face-elements.component';
import { DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE } from '../../constants/card-editor-face.constants';

@Component({
  selector: 'app-card-editor-face',
  host: {
    '(document:keyup)': 'handleCtrlUp($event)',
    '(mouseover)': 'mouseover()',
    '(mouseout)': 'mouseout()'
  },
  imports: [
    DragDropModule,
    CardEditorCardFaceElementsComponent,
    GridComponent
  ],
  templateUrl: './card-editor-face.component.html',
  styleUrl: './card-editor-face.component.scss'
})
export class CardEditorFaceComponent implements AfterViewInit {
  public readonly $editable: InputSignal<boolean> = input<boolean>(true);
  
  protected shouldSnapToGrid: boolean = false;

  protected cardFaceBorderRadius: number = DEFAULT_CARD_FACE_BORDER_RADIUS;

  protected readonly cellSizeScreen: number = DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE;

  // FIXME: Why doesn't this work
  public readonly $cardEditorFaceStyle: InputSignal<Omit<Style, 'styleId'>> = input.required<Omit<Style, 'styleId'>>();
  
  public readonly $cardEditorFace: OutputEmitterRef<ElementRef> = output<ElementRef>();
  
  public readonly $setElementAttributes: OutputEmitterRef<string> = output<string>();

  public readonly $setElementDimensions: OutputEmitterRef<Dimensions> = output<Dimensions>();

  public readonly $setElementPosition: OutputEmitterRef<Coordinates> = output<Coordinates>();
  
  public readonly $enableImageEditor: OutputEmitterRef<string> = output<string>();
  
  public readonly $enableElement: OutputEmitterRef<{
    cardFaceElementId: string,
    type: string
  }> = output<{
    cardFaceElementId: string,
    type: string
  }>();

  public readonly $toggleContextMenu: OutputEmitterRef<{
    event: MouseEvent,
    menu: 'Preview' | 'Templates'
  }>
  = output<{
    event: MouseEvent,
    menu: 'Preview' | 'Templates'
  }>();

  public readonly $deletedCardFaceElementPerCardFace: OutputEmitterRef<string> = output<string>();

  public readonly $cardFaceElementRts: InputSignal<Map<string, string>> = input<Map<string, string>>(new Map<string, string>());

  public readonly $cardFaceElementImages: InputSignal<Map<string, string>> = input<Map<string, string>>(new Map<string, string>());

  public readonly $cardFaceElementId: InputSignal<string> = input<string>('');
  
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

  public readonly $cardFaceElementPositions: InputSignal<Map<string, Coordinates>> = input<Map<string, Coordinates>>(new Map<string, Coordinates>());

  public readonly $cardFaceElementDimensions: InputSignal<Map<string, Dimensions>> = input<Map<string, Dimensions>>(new Map<string, Dimensions>());

  @ViewChild('cardEditorFace') cardEditorFace: ElementRef<HTMLDivElement>= {} as ElementRef<HTMLDivElement>;

  private isHovering: boolean = false;

  protected handleCtrlUp(event: KeyboardEvent): void {
    if (event.key === 'Control' && this.isHovering) {
      this.shouldSnapToGrid = !this.shouldSnapToGrid;
    }
  }

  protected mouseover(): void {
     this.isHovering = true;
  }

  protected mouseout(): void {
    this.isHovering = false;
  }

  constructor() {}

  public ngAfterViewInit(): void {
    this.$cardEditorFace.emit(this.cardEditorFace);
  }

  protected contextMenu(event: MouseEvent): void {
    // event.preventDefault();

    this.$toggleContextMenu.emit({
      event,
      menu: "Preview"
    });
  }

  protected setElementAttributes(cardFaceElementId: string): void {
    this.$setElementAttributes.emit(cardFaceElementId);
  }

  protected setElementPosition(coordinates: Coordinates): void {
    this.$setElementPosition.emit(coordinates);
  }

  protected setElementDimensions(dimensions: Dimensions): void {
    this.$setElementDimensions.emit(dimensions);
  }

  protected enableElement(cardFaceElementId: string, type: string): void {
    this.$enableElement.emit({cardFaceElementId, type});
  }

  protected enableImageEditor(cardFaceElementId: string): void {
    this.$enableImageEditor.emit(cardFaceElementId);
  }

  protected deletedCardFaceElementPerCardFace(id: string): void {
    this.$deletedCardFaceElementPerCardFace.emit(id);
  }
}