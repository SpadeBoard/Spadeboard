import { inject, Injectable } from '@angular/core';
import { CardPositionPerRoomApiService } from '../../card-game-core/services/card-game-core/card-position-per-room-api.service';
import { CardPositionPerRoom } from '../../card-game-core/models/card';
import { DndBoardService } from '../../card-game-core/services/dnd-board.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameRoomService {
  private cardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  private dndBoardService = inject(DndBoardService);

  constructor() { }
}
