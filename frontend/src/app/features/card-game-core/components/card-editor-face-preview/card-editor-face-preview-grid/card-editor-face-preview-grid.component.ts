import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE } from '../../../utils/card-editor-face-preview.constants';

@Component({
  selector: 'app-card-editor-face-preview-grid',
  imports: [],
  templateUrl: './card-editor-face-preview-grid.component.html',
  styleUrl: './card-editor-face-preview-grid.component.scss'
})
export class CardEditorFacePreviewGridComponent {
  shouldSnapToGrid: InputSignal<boolean> = input(false);
  shouldSnapToGridComputed: Signal<boolean> = computed(() => this.shouldSnapToGrid());

  readonly cellSizeScreen = DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE;
}
