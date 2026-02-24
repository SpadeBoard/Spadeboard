import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Observable, Subject, Subscription, tap } from 'rxjs';
import { GameRoom } from '../../models/game-room';
import { GameRoomApiService } from '../api/game-room-api.service';

@Injectable({
  providedIn: 'root'
})
export class GameRoomService {
  private readonly gameRoomApiService: GameRoomApiService = inject<GameRoomApiService>(GameRoomApiService); 
  
  public $currentGameRoomId: WritableSignal<string> = signal<string>("0");
  public $autosaveInterval: WritableSignal<number> = signal<number>(300000);

  public autosaveTimeoutSubscription: Subscription | undefined;
  
  private isSavingGameRoom: boolean = false;

  private onSaveGameRoom$$: Subject<void> = new Subject<void>();
  public readonly onSaveGameRoom$: Observable<void> = this.onSaveGameRoom$$.asObservable();

  constructor() { 

  }

  public getGameRoom$(): Observable<GameRoom | undefined> {
    return this.gameRoomApiService.getGameRoom$(this.$currentGameRoomId()).pipe(
      tap((gameRoom: GameRoom | undefined) => {
        if (gameRoom) {
          this.$autosaveInterval.set(gameRoom.autosaveInterval);
        }
      })
    );
  }

  public setCurrentGameRoomId(newCurrentGameRoomId: string): void {
    this.$currentGameRoomId.set(newCurrentGameRoomId);
  }

  public setIsSavingGameRoom(newIsSavingGameRoom: boolean, newCurrentGameRoomId?: string): void {
    if (this.$currentGameRoomId() !== newCurrentGameRoomId) return;

    this.isSavingGameRoom = newIsSavingGameRoom;
  }

  public setCurrentGameRoom(newCurrentGameRoomId: string): void {
    this.$currentGameRoomId.set(newCurrentGameRoomId);
  }

  public getCurrentGameRoom(): string {
    return this.$currentGameRoomId();
  }

  // TODO: Handle where you're saving and autosaving simultaneously, DB Concurrency Exception issues? Gotta disable the Save button somehow, send a signal here?
  public onAutosaveTimeout(destroyRef: DestroyRef): void {
    this.autosaveTimeoutSubscription = interval(this.$autosaveInterval())
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        this.onSave();
    });
  }

  public onSave(): void {
    // TODO: Sends a message to the other subscribed functions to run their saving
    this.onSaveGameRoom$$.next();
  }
}
