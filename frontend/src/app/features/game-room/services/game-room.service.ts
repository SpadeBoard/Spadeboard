import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { CardPositionPerRoomApiService } from '../../card-game-core/services/card-game-core/card-position-per-room-api.service';
import { CardPositionPerRoom } from '../../card-game-core/models/card';
import { DndBoardService } from '../../drag-and-drop/services/dnd-board.service';
import { BehaviorSubject, interval, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameRoomService {
  private cardPositionPerRoomApiService = inject(CardPositionPerRoomApiService);
  private dndBoardService = inject(DndBoardService);

  currentGameRoomId: WritableSignal<number> = signal<number>(0);
  autosaveInterval: WritableSignal<number> = signal<number>(300000);

  
  private isSavingGameRoom: boolean = false;

  private onSaveGameRoom$$ = new Subject<void>();
  onSaveGameRoom$ = this.onSaveGameRoom$$.asObservable();

  constructor() { }

  setCurrentGameRoomId(newCurrentGameRoomId: number) {
    this.currentGameRoomId.set(newCurrentGameRoomId);
  }

  setIsSavingGameRoom(newIsSavingGameRoom: boolean, newCurrentGameRoomId?: number) {
    if (this.currentGameRoomId() !== newCurrentGameRoomId)
      return;

    this.isSavingGameRoom = newIsSavingGameRoom;
  }

  setCurrentGameRoom(newCurrentGameRoomId: number) {
    this.currentGameRoomId.set(newCurrentGameRoomId);
  }

  getCurrentGameRoom(): number {
    return this.currentGameRoomId();
  }

  // TODO: Handle where you're saving and autosaving simultaneously, DB Concurrency Exception issues? Gotta disable the Save button somehow, send a signal here?
  onAutosaveTimeout(): void {
    let autosaveTimeoutSubscription = interval(this.autosaveInterval()).subscribe(() => {
      this.onSave();
    });
  }

  onSave(): void {
    // TODO: Sends a message to the other subscribed functions to run their saving
    this.onSaveGameRoom$$.next();
  }
}
