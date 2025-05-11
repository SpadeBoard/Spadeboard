import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardPositionPerRoom } from '../../models/card';

@Injectable({
  providedIn: 'root'
})
export class CardPositionPerRoomApiService {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/CardPositionPerRooms`;
  
  constructor() { }

  getCardsPositionPerRoomByRoomId(gameRoomId: string): Observable<CardPositionPerRoom[] | undefined> {
    return this.http.get<CardPositionPerRoom[]>(`${this.apiUrl}/nav/room/${gameRoomId}`);
  }

  // TODO: Do a DTO? Gotta add the position and item separately
  createCardPositionPerRoom(cpr: CardPositionPerRoom): Observable<CardPositionPerRoom | undefined> {
    // TODO: Make a separate function for updating navs
    return this.http.post<CardPositionPerRoom>(`${this.apiUrl}/nav`, cpr);
  }

  updateCardsPositionPerRoom(cprs: CardPositionPerRoom[]): Observable<CardPositionPerRoom[] | undefined> {
    return this.http.put<CardPositionPerRoom[]>(`${this.apiUrl}/nav`, cprs);
  }

  // TODO: Two options, delete nav vs delete just the reference?
  deleteCardPositionPerRoom(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
