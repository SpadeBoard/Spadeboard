import { Component, inject, ViewChild } from '@angular/core';
import { CardEditorFacePreviewComponent } from '../card-editor-face-preview/card-editor-face-preview.component';
import { CardEditorPreviewService } from '../../services/card-game-core/card-editor/preview/card-editor-preview.service';
import { CardEditorCardOperationsButtonComponent } from '../card-editor-card-operations-button/card-editor-card-operations-button.component';
import { CardEditorPreviewChangeFaceComponent } from '../card-editor-preview-change-face/card-editor-preview-change-face.component';
import { CardEditorPreviewTagsComponent } from '../card-editor-preview-tags/card-editor-preview-tags.component';
import { CardEditorOperationsService } from '../../services/card-game-core/card-editor/operations/card-editor-operations.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-card-editor-preview',
  imports: [
    CardEditorCardOperationsButtonComponent, 
    CardEditorPreviewChangeFaceComponent, 
    CardEditorFacePreviewComponent,
    CardEditorPreviewTagsComponent],
  templateUrl: './card-editor-preview.component.html',
  styleUrl: './card-editor-preview.component.scss'
})
export class CardEditorPreviewComponent {
  private readonly cardEditorPreviewService: CardEditorPreviewService = inject(CardEditorPreviewService);

  private readonly cardEditorOperationsService: CardEditorOperationsService = inject(CardEditorOperationsService);
  
  private readonly userService: UserService = inject(UserService);

  @ViewChild(CardEditorFacePreviewComponent)cardEditorFacePreview!: CardEditorFacePreviewComponent;

  @ViewChild(CardEditorCardOperationsButtonComponent) cardOperationsBtn!: CardEditorCardOperationsButtonComponent;

  constructor() {
  }

  protected getCardName(): string {
   return this.cardEditorPreviewService.getCardName();
  }

  protected onNameChange(event: Event): void {
    let value = (event.target as HTMLInputElement).value;
    this.cardEditorPreviewService.setCardName(value);
  }

  protected $handleCardCreate(): void {
    // CHECKME: Assign owner here?
    this.cardEditorPreviewService.cardEditorCardDto.ownerId = this.userService.$userId();
    this.cardEditorOperationsService.clickCreate();
  }

  protected $handleCardSave(): void {
    this.cardEditorOperationsService.clickSave();
  }
}
