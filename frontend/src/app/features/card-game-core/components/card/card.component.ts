import { Component, Signal, viewChildren, output, input, inject, effect, computed, SimpleChanges, InputSignal, Input, HostListener, ViewChild, ElementRef, AfterViewInit, afterRenderEffect } from '@angular/core';

import { Card } from '../../models/card';
import { cardFlipAnimation } from './card.animations';

import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';
import { DndContentDirective } from '../../../drag-and-drop/directives/dnd-content.directive';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';

import { Style } from '../../../style/models/style';
import { CardFaceComponent } from '../card-face/card-face.component';
import { parseCssDimension, parseCssDimensionToNumber } from '../../../style/utils/parse-css-dimensions.utils';
import { CardFaceApiService } from '../../services/card-game-core/card-face-api.service';
import { CardFace } from '../../models/card-face';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { convertToRelativeCoordinates, convertToRelativeDimensions } from '../../../drag-and-drop/utils/coordinate-conversions.utils';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { CardEditorPreviewService } from '../../services/card-editor-preview.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { ActionContextMenuComponent } from '../../../actions-context-menu/components/action-context-menu/action-context-menu/action-context-menu.component';

@Component({
  selector: 'app-card',
  imports: [
    DndContentDirective, CardFaceComponent,
    CommonModule, ActionContextMenuComponent
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  // animations: [cardFlipAnimation]
})
export class CardComponent {
  private readonly cardFaceApiService: CardFaceApiService = inject(CardFaceApiService);
  private readonly cardPreviewEditorService: CardEditorPreviewService = inject(CardEditorPreviewService);
  private readonly cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);
  // https://medium.com/@chandrashekharsingh25/angular-signals-explained-with-practical-examples-e45de6d00925
  // Might need computed signals then

  private rightClickMenuPositionX: number = 0;
  private rightClickMenuPositionY: number = 0;

  @ViewChild('cardFace') cardFaceRef!: CardFaceComponent;

  card: InputSignal<Card> = input<Card >({
    cardId: "0",
    currentCardFaceIndex: 0,
    cardName: '',
    isTemplate: false
  });

  cardFaces: CardFace[] = [

  ];

  currentCardFace: CardFace = {
    cardFaceId: "0",
    style: {
      styleId: "0"
    }
  }

  cardChange = output<Card>();

  isDisplayContextMenu: boolean = false;

  // TODO: Probably refactor this, how do we get this information up there?
  actionContextMenuItems: ActionContextMenuItem[] = [
    {
      id: 0,
      name: 'Flip',
      action: (card?: Card) => {
        if (!card) return;
        card.currentCardFaceIndex = (card.currentCardFaceIndex === 0) ? 1 : 0;
        this.currentCardFace = this.cardFaces[card.currentCardFaceIndex];
      }
    },
    {
      id: 1,
      name: 'Edit Card',
      action: (card?: Card) => {
        if (!card) return;
        this.cardPreviewEditorService.getCardEditorCardDtoByCardId(card.cardId);
        this.cardGameCoreService.setIsCardEditorOpen(!this.cardGameCoreService.isCardEditorOpen());
      }
    },
    {
      id: 2,
      name: 'Delete Card',
      action: (card?: Card) => {
        if (!card) return;
        this.cardPreviewEditorService.deleteCard(card.cardId);
      }
    }
  ];



  actionContextMenuItemsChange = output<ActionContextMenuItem[]>();

  cardScale: InputSignal<number> =  input<number>(1);
  cardScaleComputed: Signal<number>  = computed(() => this.cardScale());

  transform() {
    return `scale(${this.cardScaleComputed()})`;
  }
  
  constructor() {
    effect(() => {
      let card: Card | undefined = this.card();
      
      // https://builtin.com/software-engineering-perspectives/forkjoin
      if (card !== undefined) {
        this.loadCardFaces(card);
      }
    });
  }

  setCardFaceImageDimensionsOnDndBoard(): void {
    if (this.cardFaceRef && this.cardScale() && this.cardScale() !== 0) {
      this.cardFaceRef.setCardFaceImageDimensions(this.cardScale());
    }
  }

  // TODO: Rework this, use cardApiService to get the card face IDs, then use a switch map, pass it into the next then assign the cardFaces
  private loadCardFaces(card: Card): void {
    this.cardFaceApiService.getCardFacesPerCard$(card.cardId).subscribe((result: CardFace[] | undefined) => {
      if (result != undefined) {
        this.cardFaces = result;
        this.currentCardFace = this.cardFaces[0];
      }
    });
  }

  onCardRightClick(event: MouseEvent): void {
    if (this.card().cardId === "0")
      return;

      event.preventDefault();
      this.rightClickMenuPositionX = event.clientX;
      this.rightClickMenuPositionY = event.clientY;
  
      this.isDisplayContextMenu = true;
    }
  
  @HostListener('document:click')
  documentClick(): void {
    this.isDisplayContextMenu = false;
  }

  getRightClickMenuStyle() {
    return {
      position: 'fixed',
      left: `${this.rightClickMenuPositionX}px`,
      top: `${this.rightClickMenuPositionY}px`
    }
  }

  handleActionContextMenuItemClick(item: ActionContextMenuItem) {
    item.action(this.card());
  }
}
