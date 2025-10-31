import { Component, inject, output, OutputEmitterRef } from '@angular/core';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardEditorCardDto } from '../../models/card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardEditorApiService } from '../../services/card-game-core/card-editor/api/card-editor-api.service';

@Component({
  selector: 'app-card-editor-card-operations-button',
  imports: [],
  templateUrl: './card-editor-card-operations-button.component.html',
  styleUrl: './card-editor-card-operations-button.component.scss'
})
export class CardEditorCardOperationsButtonComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardEditorApiService: CardEditorApiService = inject(CardEditorApiService);

  protected hasCreated: boolean = false;

  protected $handleCardCreate: OutputEmitterRef<void> = output<void>();
  
  protected $handleCardSave: OutputEmitterRef<void> = output<void>();

  constructor() {
    this.setHasCreated();
    this.onCreateCardEditorCardDto();
    this.setCardEditorCardDto();
  }

  private onCreateCardEditorCardDto(): void {
    this.cardEditorApiService.createdCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
     this.setHasCreated();
    })
  }

  private setHasCreated(condition?: () => boolean): void {
    // CHECKME: Is the cardEditorCardDto being updated properly?
    this.hasCreated = (!condition) ? !this.cardEditorPreviewService.isNewCardEditorCardDto() : condition();
  }

  protected createCard(event: Event): void {
    this.$handleCardCreate.emit();
  }

  protected saveCard(event: Event): void {
    this.$handleCardSave.emit();
  }

  private setCardEditorCardDto(): void {
    this.cardEditorPreviewService.setCardEditorCardDto$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
      this.setHasCreated();
    })
  }
}
