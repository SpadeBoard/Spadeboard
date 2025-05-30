import { inject, Injectable, ResourceLoaderParams, ResourceRef } from '@angular/core';
import { CardFaceElement } from '../../models/card-face-element';

import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementApiService {

  private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/CardFaceElements`;
  
  constructor() { }

  getCardFaceElement$(cardFaceElementId: string): Observable<CardFaceElement | undefined> {
    return this.http.get<CardFaceElement>(`${this.apiUrl}/nav/${cardFaceElementId}`);
  }

  deleteCardFaceElementPerCardFace$(cardFaceElementPerCardFaceId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/nav/card-face-element-per-card-face/${cardFaceElementPerCardFaceId}`).pipe(
      catchError((error) => {
        if (error.status === 404) {
          console.error('Card face element not found');
        }
        return throwError(error);
      })
    );
  }

  // TODO: Call the card face element stored procedure
}
