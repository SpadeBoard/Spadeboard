import { Component, inject } from '@angular/core';
import { SPADEBOARD_WIKI_CARD_EDITOR_URL } from '../../../../utils/wiki.constants';
import { CardEditorInfoService } from '../../services/card-editor-info.service';

@Component({
  selector: 'app-card-editor-info',
  imports: [],
  templateUrl: './card-editor-info.component.html',
  styleUrl: './card-editor-info.component.scss'
})
export class CardEditorInfoComponent {
  private readonly cardEditorInfoService: CardEditorInfoService = inject(CardEditorInfoService);
  
  onInfoClick(event: Event): void {
    this.cardEditorInfoService.setOnInfoUrlChange(SPADEBOARD_WIKI_CARD_EDITOR_URL);
  }
}
