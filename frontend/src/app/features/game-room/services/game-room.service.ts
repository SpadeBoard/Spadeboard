import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Observable, Subject, tap } from 'rxjs';
import { GameRoom } from '../models/game-room/game-room';
import { GameRoomApiService } from './game-room-api.service';

@Injectable({
  providedIn: 'root'
})
export class GameRoomService {
  private readonly gameRoomApiService: GameRoomApiService = inject(GameRoomApiService); 
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  currentGameRoomId: WritableSignal<string> = signal<string>("0");
  autosaveInterval: WritableSignal<number> = signal<number>(300000);

  
  private isSavingGameRoom: boolean = false;

  private onSaveGameRoom$$ = new Subject<void>();
  onSaveGameRoom$ = this.onSaveGameRoom$$.asObservable();

  constructor() { 

  }

  getGameRoom$(): Observable<GameRoom | undefined> {
    return this.gameRoomApiService.getGameRoom$(this.currentGameRoomId()).pipe(
      tap((gameRoom: GameRoom | undefined) => {
        if (gameRoom) {
          this.autosaveInterval.set(gameRoom.autosaveInterval);
        }
      })
    );
  }

  setCurrentGameRoomId(newCurrentGameRoomId: string) {
    this.currentGameRoomId.set(newCurrentGameRoomId);
  }

  setIsSavingGameRoom(newIsSavingGameRoom: boolean, newCurrentGameRoomId?: string) {
    if (this.currentGameRoomId() !== newCurrentGameRoomId)
      return;

    this.isSavingGameRoom = newIsSavingGameRoom;
  }

  setCurrentGameRoom(newCurrentGameRoomId: string) {
    this.currentGameRoomId.set(newCurrentGameRoomId);
  }

  getCurrentGameRoom(): string {
    return this.currentGameRoomId();
  }

  // TODO: Handle where you're saving and autosaving simultaneously, DB Concurrency Exception issues? Gotta disable the Save button somehow, send a signal here?
  onAutosaveTimeout(): void {
    let autosaveTimeoutSubscription = interval(this.autosaveInterval())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.onSave();
    });
  }

  onSave(): void {
    // TODO: Sends a message to the other subscribed functions to run their saving
    this.onSaveGameRoom$$.next();
  }
}
