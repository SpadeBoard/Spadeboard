import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';

@Component({
  selector: 'app-card-editor-change-face',
  imports: [],
  templateUrl: './card-editor-change-face.component.html',
  styleUrl: './card-editor-change-face.component.scss'
})
export class CardEditorChangeFaceComponent {
    public readonly $isFlipped: InputSignal<boolean> = input.required<boolean>();
    
    public readonly $activateFlip: OutputEmitterRef<void> = output<void>();

    protected activateFlip(event: Event): void {
      this.$activateFlip.emit();
    }
}
