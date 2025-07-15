import { Component } from '@angular/core';

import { Card } from '../../models/card';
import { DndBoardService } from '../../../drag-and-drop/services/dnd-board.service';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-hand',
  imports: [],
  templateUrl: './hand.component.html',
  styleUrl: './hand.component.scss'
})
export class HandComponent {
  // TODO: Fix all of this, this is placeholder, limit the amount of cards allowed in a hand
  slots = [null, null, null, null, null];
  
  cards: Card[] = [];

  constructor(private dndBoardService: DndBoardService) {}

  onCustomDrop(event: CdkDragDrop<any>)
  {
    moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
  }
}
