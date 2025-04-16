import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardPositionPerRoom } from '../models/card';

@Injectable({
  providedIn: 'root'
})
export class CardPositionPerRoomApiService {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/CardPositionPerRooms`;
  
  constructor() { }

  getCardsPositionPerRoomByRoomId(gameRoomId: number): Observable<CardPositionPerRoom[] | undefined> {
    return this.http.get<CardPositionPerRoom[]>(`${this.apiUrl}/room/${gameRoomId}`);
  }

  // TODO: Do a DTO? Gotta add the position and item separately
  createCardPositionPerRoom(cpr: CardPositionPerRoom): Observable<CardPositionPerRoom | undefined> {
    return this.http.post<CardPositionPerRoom>(`${this.apiUrl}`, cpr);
  }
}
