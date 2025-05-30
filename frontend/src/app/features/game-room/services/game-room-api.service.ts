import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { GameRoom } from '../models/game-room/game-room';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameRoomApiService {
  private http: HttpClient = inject(HttpClient);

  // TODO: Replace with actual API url from the config
  private apiUrl: string = `${environment.hostServerUrl}/api/GameRooms`;

  constructor() { }

  getGameRoom$(gameRoomId: string): Observable<GameRoom | undefined> {
    return this.http.get<GameRoom>(`${this.apiUrl}/${gameRoomId}`);
  }

  createGameRoom$(gameRoom: GameRoom): Observable<GameRoom | undefined> {
    if (!gameRoom) {
      return of(undefined);
    }
    // TODO: Separate properties
    return this.http.post<GameRoom>(this.apiUrl, gameRoom);
  }

  updateGameRoom$(gameRoom: GameRoom): Observable<void | undefined> {
    return this.http.put<void>(`${this.apiUrl}/${gameRoom.gameRoomId}`, gameRoom);
  }

  deleteGameRoom$(id: string): Observable<void | undefined> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
