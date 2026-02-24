import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { GameRoom } from '../../models/game-room';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameRoomApiService {
  private readonly http: HttpClient = inject<HttpClient>(HttpClient);

  // TODO: Replace with actual API url from the config
  private readonly apiUrl: string = `${environment.hostServerUrl}/api/GameRooms`;

  constructor() { }

  public getGameRoom$(gameRoomId: string): Observable<GameRoom | undefined> {
    return this.http.get<GameRoom>(`${this.apiUrl}/${gameRoomId}`);
  }

  public createGameRoom$(gameRoom: GameRoom): Observable<GameRoom | undefined> {
    if (!gameRoom) {
      return of(undefined);
    }
    // TODO: Separate properties
    return this.http.post<GameRoom>(this.apiUrl, gameRoom);
  }

  public updateGameRoom$(gameRoom: GameRoom): Observable<void | undefined> {
    return this.http.put<void>(`${this.apiUrl}/${gameRoom.gameRoomId}`, gameRoom);
  }

  public deleteGameRoom$(id: string): Observable<void | undefined> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
