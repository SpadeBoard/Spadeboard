import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { CardComponent } from '../../../card/components/core/card.component';
import { CardPlaceholderComponent } from '../../../card/components/placeholder/card-placeholder.component';
import { Card } from '../../../card/models/card';
import { DEFAULT_CARD_SCALE } from '../../../utils/card.constants';

@Component({
  selector: 'app-card-templates',
  imports: [
    CardPlaceholderComponent, 
    CardComponent
  ],
  templateUrl: './card-templates.component.html',
  styleUrl: './card-templates.component.scss'
})
export class CardTemplatesComponent {
  protected isMenuOpen: boolean = false;

  public readonly $cardTemplates: InputSignal<Card[]> = input<Card[]>([]);

  public readonly $currentEditedCardId: InputSignal<string> = input<string>('');

  public readonly $selectCard: OutputEmitterRef<string> = output<string>();

  public readonly $deleteCard: OutputEmitterRef<string> = output<string>();

  public readonly $collectionContextCardId: OutputEmitterRef<string> = output<string>();

  public readonly $toggleContextMenu: OutputEmitterRef<{
    event: MouseEvent,
    menu: 'Preview' | 'Templates'
  }>
    = output<{
      event: MouseEvent,
      menu: 'Preview' | 'Templates'
    }>();

  public readonly new: Card = {
    cardId: "0",
    cardName: 'New',
    currentCardFaceId: "0"
  }

  protected getDefaultCardScale(): number {
    return DEFAULT_CARD_SCALE;
  }

  constructor() {}

  protected toggleMenu(event: Event): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  protected selectCard(event: Event, cardId: string): void {
    this.$selectCard.emit(cardId);
  }
  
  protected toggleContextMenu(info: {event: MouseEvent, menu: 'Preview' | 'Templates'}): void {
    this.$toggleContextMenu.emit(info);
  }

  protected setCollectionContextCardId(cardId: string): void {
    this.$collectionContextCardId.emit(cardId);
  }

  protected onCardRightClick(event: MouseEvent, cardId: string): void {
    event.preventDefault();

    if (cardId === "0") return;

    this.$collectionContextCardId.emit(cardId);

    this.$toggleContextMenu.emit({event, menu: 'Templates'});
  }
}
