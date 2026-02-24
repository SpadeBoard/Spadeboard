import { Component, output, OutputEmitterRef } from '@angular/core';

@Component({
  selector: 'app-card-editor-close',
  imports: [],
  templateUrl: './card-editor-close.component.html',
  styleUrl: './card-editor-close.component.scss'
})
export class CardEditorCloseComponent {
  public readonly $handleClose: OutputEmitterRef<void> = output<void>();

  protected handleClose(event: Event): void {
    this.$handleClose.emit();
  }
}
