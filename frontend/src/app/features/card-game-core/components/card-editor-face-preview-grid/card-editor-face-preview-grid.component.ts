import { Component, computed, input, InputSignal, Signal } from '@angular/core';

@Component({
  selector: 'app-card-editor-face-preview-grid',
  imports: [],
  templateUrl: './card-editor-face-preview-grid.component.html',
  styleUrl: './card-editor-face-preview-grid.component.css'
})
export class CardEditorFacePreviewGridComponent {
  shouldSnapToGrid: InputSignal<boolean> = input(false);
  shouldSnapToGridComputed: Signal<boolean> = computed(() => this.shouldSnapToGrid());
}
