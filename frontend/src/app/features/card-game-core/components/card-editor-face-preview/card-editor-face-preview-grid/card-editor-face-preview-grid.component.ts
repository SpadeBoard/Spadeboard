import { Component, input, InputSignal } from '@angular/core';
import { DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE } from '../../../utils/card-editor-face-preview.constants';

@Component({
  selector: 'app-card-editor-face-preview-grid',
  imports: [],
  templateUrl: './card-editor-face-preview-grid.component.html',
  styleUrl: './card-editor-face-preview-grid.component.scss'
})
export class CardEditorFacePreviewGridComponent {
  public readonly $shouldSnapToGrid: InputSignal<boolean> = input<boolean>(false);

  public readonly cellSizeScreen: number = DEFAULT_CARD_EDITOR_FACE_PREVIEW_CELL_SIZE;
}
