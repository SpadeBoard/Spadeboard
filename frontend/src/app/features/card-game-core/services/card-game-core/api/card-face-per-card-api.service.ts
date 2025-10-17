import { inject, Injectable } from '@angular/core';
import { CardFace } from '../../../models/card-face';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardFacePerCardApiService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.hostServerUrl}/api/CardFacesPerCard`;

  constructor() { }

  getCardFacesPerCard$(cardId: string): Observable<CardFace[] | undefined> {
    return this.http.get<CardFace[]>(`${this.apiUrl}/card/${cardId}`);
  }

  getCardFacesByLod$(cardId: string, lod: number): Observable<Blob | undefined> {
    return this.http.get(`${this.apiUrl}/card/${cardId}/${lod}`, { responseType: 'blob' });
  }
}
