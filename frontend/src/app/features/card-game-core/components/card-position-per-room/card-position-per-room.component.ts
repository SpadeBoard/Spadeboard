import { Component, effect, inject, Injectable, input  } from '@angular/core';
import { CardPositionPerRoomApiService } from '../../services/card-game-core/card-position-per-room-api.service';
import { CardPositionPerRoom } from '../../models/card';
import { CdkDrag, CdkDragDrop, CdkDragMove} from '@angular/cdk/drag-drop';
import { CardComponent } from '../card/card.component';
import { DndPosition } from '../../../drag-and-drop/models/dnd-types';
import { GameRoomService } from '../../../game-room/services/game-room.service';
import { CardGameCoreService } from '../../services/card-game-core/card-game-core.service';
import { mergeMap } from 'rxjs';

@Component({
  selector: 'app-card-position-per-room',
  imports: [
    CdkDrag,
    CardComponent
  ],
  templateUrl: './card-position-per-room.component.html',
  styleUrl: './card-position-per-room.component.css'
})
export class CardPositionPerRoomComponent {
  private cardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  private cardGameCoreService: CardGameCoreService = inject(CardGameCoreService);

  cprs: CardPositionPerRoom[] = [];

  constructor() {
    effect(() => {
      if (this.cardGameCoreService.gameRoomId() > 0) {
        this.getCardsPositionPerRoomByRoomId(this.cardGameCoreService.gameRoomId());
      }
    });
  }

  ngOnInit() {
    this.createCardPositionPerRoom();
  }

  private getCardPositionPerRoom() {
    this.cardGameCoreService.cardPositionPerRoomId$.subscribe((idx: number) => {
      
    });
  }
  
  // Reference: https://www.angularspace.com/creating-custom-rxresource-api-with-observables/
  private getCardsPositionPerRoomByRoomId(gameRoomId: number): void {
    // TODO
    this.cardPositionPerRoomApiService.getCardsPositionPerRoomByRoomId(
      gameRoomId).subscribe((result: CardPositionPerRoom[] | undefined) => {
        if (result !== undefined)
          this.cprs = result;
    });
  }

  private findCardPositionPerRoom(cardId: number): CardPositionPerRoom | undefined{
    return this.cprs.find((cpr) => cpr.card.cardId == cardId);
  }

  private createCardPositionPerRoom() { 
    this.cardGameCoreService.cardPositionPerRoom$
      .pipe(
        mergeMap((cpr: CardPositionPerRoom) =>
          this.cardPositionPerRoomApiService.createCardPositionPerRoom(cpr)
        )
      )
      .subscribe((result: CardPositionPerRoom | undefined) => {
        if (result !== undefined) {
          this.cprs.push(result);
        }
      });
  }

  // TODO: Get the card via the ID as well as position
  // TODO: Create a new card position per room

  // TODO: Update to the backend based on idle period
  private updateCardPositionPerRoom(updatedCpr: CardPositionPerRoom) {
    let cprToReplace = this.findCardPositionPerRoom(updatedCpr.card.cardId);

    if (cprToReplace !== undefined) {
      Object.assign(cprToReplace, updatedCpr);
    }
  }

  private deleteCardPositionPerRoom(id: number) {
    // TODO: Delete from the bridge table

    // TODO: If it's the only reference in there, then delete the entire card from the database
  }

  onDragMoved(event: CdkDragMove) {
  }

  onDragDrop(event: CdkDragDrop<any[]>, item: CardPositionPerRoom) {
    item.dndPosition = {x: event.dropPoint.x, y: event.dropPoint.y};

    console.log(`On drag drop card position per room: ${JSON.stringify(item.dndPosition)}`);

    this.updateCardPositionPerRoom(item);
  }
}
