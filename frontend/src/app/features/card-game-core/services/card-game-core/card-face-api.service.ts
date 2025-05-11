import { inject, Injectable, ResourceLoaderParams, ResourceRef } from '@angular/core';
import { CardFace } from '../../models/card-face';

import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardFaceApiService {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/cardFaces`;

  constructor() { }

  getCardFaces(cardId?: number): Observable<CardFace[] | undefined> {
    /*if (cardId !== undefined) {
      return this.http.get<CardFace[]>(`${this.apiUrl}/card/${cardId}`);
    }*/

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
