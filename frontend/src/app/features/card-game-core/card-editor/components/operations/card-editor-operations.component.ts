import { Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/button/button.component';
import { Style } from '../../../../style/models/style';

@Component({
  selector: 'app-card-editor-operations',
  imports: [ButtonComponent],
  templateUrl: './card-editor-operations.component.html',
  styleUrl: './card-editor-operations.component.scss'
})
export class CardEditorOperationsComponent {
  public readonly $hasCreated: InputSignal<boolean> = input<boolean>(false);

  protected readonly $handleCardCreate: OutputEmitterRef<void> = output<void>();
  
  protected readonly $handleCardSave: OutputEmitterRef<void> = output<void>();

  protected readonly $createButtonText: Signal<string> = computed<"Duplicate" | "Create">(() => {
    return this.$hasCreated() ? 'Duplicate' : 'Create';
  });

  protected readonly style: Omit<Style, 'styleId'> = {
    borderRadius: '12px',
    fontSize: 'medium',
    padding: '10px 18px',
    marginRight: '7px'
  };

  constructor() {}

  protected createCard(event: Event): void {
    this.$handleCardCreate.emit();
  }

  protected saveCard(event: Event): void {
    this.$handleCardSave.emit();
  }
}
