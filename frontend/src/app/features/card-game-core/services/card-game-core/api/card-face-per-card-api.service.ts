import { inject, Injectable } from '@angular/core';
import { CardFace } from '../../../card-face/models/card-face';

import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Card } from '../../../card/models/card';
import { logInfo } from '../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardFacePerCardApiService {
  private http = inject<HttpClient>(HttpClient);

  private apiUrl = `${environment.hostServerUrl}/api/CardFacesPerCard`;

  constructor() { }

  // TODO: Modify backend to just grab the IDs directly instead of piping
  public getCardFacesPerCardIds$(card: Card): Observable<string[]> {
    return this.getCardFacesPerCard$(card.cardId)
    .pipe(
      map((cardFaces: CardFace[] | undefined) => {
        if (!cardFaces) throw new Error(`${logInfo(this.constructor.name, this.getCardFacesPerCardIds$.name)}: No card faces retrieved`);

        return cardFaces.map((cardFace: CardFace) => cardFace.cardFaceId);
      })
    );
  }

  getCardFacesPerCard$(cardId: string): Observable<CardFace[] | undefined> {
    return this.http.get<CardFace[]>(`${this.apiUrl}/card/${cardId}`);
  }

  getCardFacesByLod$(cardId: string, lod: number): Observable<Blob | undefined> {
    return this.http.get(`${this.apiUrl}/card/${cardId}/${lod}`, { responseType: 'blob' });
  }
}
