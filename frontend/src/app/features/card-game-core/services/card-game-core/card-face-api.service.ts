import { inject, Injectable } from '@angular/core';
import { CardFace } from '../../models/card-face';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardFaceApiService {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/CardFaces`;

  constructor() { }

  getCardFaces$(): Observable<CardFace[] | undefined> {
    return this.http.get<CardFace[]>(this.apiUrl);
  }

  getCardFace$(cardFaceId: string): Observable<CardFace | undefined> {
    return this.http.get<CardFace>(`${this.apiUrl}/dto/${cardFaceId}`);
    // return this.http.get<CardFace>(`${this.apiUrl}/${cardFaceId}`);
  }

  getCardFacesPerCard$(cardId: string): Observable<CardFace[] | undefined> {
    return this.http.get<CardFace[]>(`${this.apiUrl}/card-face-per-card/${cardId}`);
  }
}
