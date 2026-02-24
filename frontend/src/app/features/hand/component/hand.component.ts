import { Component, input, InputSignal } from '@angular/core';

import { Card } from '../../card-game-core/card/models/card';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-hand',
  imports: [],
  templateUrl: './hand.component.html',
  styleUrl: './hand.component.scss'
})
export class HandComponent {
  public readonly $max: InputSignal<number> = input<number>(5);

  // TODO: Fix all of this, this is placeholder, limit the amount of cards allowed in a hand
  private slots: Card[] = [];

  constructor() {}

  protected onCustomDrop(event: CdkDragDrop<any>): void
  {
    moveItemInArray(this.slots, event.previousIndex, event.currentIndex);
  }
}
