import { inject, Injectable } from '@angular/core';
import { CardFace } from '../../../../models/card-face';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardFaceApiService {
  private readonly http: HttpClient = inject(HttpClient);
  
  private readonly apiUrl: string = `${environment.hostServerUrl}/api/CardFaces`;

  constructor() { }

  public getCardFaces$(): Observable<CardFace[] | undefined> {
    return this.http.get<CardFace[]>(this.apiUrl);
  }

  public getCardFace$(cardFaceId: string): Observable<CardFace | undefined> {
    return this.http.get<CardFace>(`${this.apiUrl}/dto/${cardFaceId}`);
    // return this.http.get<CardFace>(`${this.apiUrl}/${cardFaceId}`);
  }
}
