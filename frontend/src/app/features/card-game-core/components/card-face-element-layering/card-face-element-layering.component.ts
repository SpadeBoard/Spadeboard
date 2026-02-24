import { Component, output, OutputEmitterRef } from '@angular/core';

@Component({
  selector: 'app-card-face-element-layering',
  imports: [],
  templateUrl: './card-face-element-layering.component.html',
  styleUrl: './card-face-element-layering.component.scss'
})
export class CardFaceElementLayeringComponent {
  public readonly $setLayeringOperation: OutputEmitterRef<'front' | 'back' | 'forward' | 'backward'> = output<'front' | 'back' | 'forward' | 'backward'>();

  protected onBringToFront(event: Event): void {
    this.$setLayeringOperation.emit('front');
  }
  
  protected onSendToBack(event: Event): void {
    this.$setLayeringOperation.emit('back');
  }

  protected onBringForward(event: Event): void {
    this.$setLayeringOperation.emit('forward');
  }

  protected onSendBackwards(event: Event): void {
    this.$setLayeringOperation.emit('backward');
  }
}
