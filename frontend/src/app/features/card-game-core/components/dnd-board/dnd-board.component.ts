import { Component, HostListener, inject, input, output } from '@angular/core';
import { DndBoardService } from '../../services/dnd-board.service';
import { ActionContextMenuItem } from '../../../actions-context-menu/models/action-context-menu-item';
import { map, Subscription } from 'rxjs';
import { Deck } from '../../models/deck';
import { Card, CardPositionPerRoom } from '../../models/card';
import { isCard, isDeck } from '../../utils/card-game-core.utils';
import { CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragMove, CdkDropList } from '@angular/cdk/drag-drop';
import { DndFunctionality } from '../../../drag-and-drop/models/dnd-functionality';
import { CardEditorComponent } from '../card-editor/card-editor.component';
import { DisplaceCardMenuComponent } from '../displace-card-menu/displace-card-menu.component';
import { CardFace } from '../../models/card-face';
import { CardFaceElement } from '../../models/card-face-element';
import { CardPositionPerRoomService } from '../../services/card-game-core/card-position-per-room.service';
import { CardPositionPerRoomComponent } from '../card-position-per-room/card-position-per-room.component';
import { GameRoomService } from '../../../game-room/services/game-room.service';

// ROLE: AUTOLOAD

// TODO: FIGURE OUT HIERARCHAL RELATIONSHIP
/************************************************************
app-dnd-board (root)          ↑ 
|   app-dnd-wrapper (parent)          | 
|                                                      |
↓     app-card (child)                       | signal up (card)

/*************************************************************/
@Component({
  selector: 'app-dnd-board',
  imports: [
    CdkDropList,
    CardPositionPerRoomComponent
  ],
  templateUrl: './dnd-board.component.html',
  styleUrl: './dnd-board.component.css'
})
export class DndBoardComponent {
  // TODO:
  // 1. If drags on top of something that is droppable
  // 2. Then appear menu to determine whether to add to it

  // TODO: Populate this
  gameRoomId: number = 1;
  ownerId: string = "5811e387-1551-4090-9485-a3ebe30efb5a"; // TODO: Should be admin of room

  constructor() {

  }
}
