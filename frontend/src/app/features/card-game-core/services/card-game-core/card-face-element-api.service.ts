import { inject, Injectable, ResourceLoaderParams, ResourceRef } from '@angular/core';
import { CardFaceElement, CardFaceElementDto } from '../../models/card-face-element';
import { rxResource } from '@angular/core/rxjs-interop';

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

  getCardFaceElements$(cardFaceId?: number): Observable<CardFaceElement[] | CardFaceElementDto[] | undefined> {
    if (cardFaceId !== undefined) {
      return this.http.get<CardFaceElementDto[]>(`${this.apiUrl}/CardFace/dto/${cardFaceId}`);
      // return this.http.get<CardFaceElement[]>(`${this.apiUrl}/dto/${cardFaceId}`);
    }
    
    return this.http.get<CardFaceElement[]>(`${this.apiUrl}`);
  }

  getCardFaceElement$(cardFaceElementId: number): Observable<CardFaceElement | undefined> {
    return this.http.get<CardFaceElement>(`${this.apiUrl}/nav/${cardFaceElementId}`);
  }

  deleteCardFaceElement$(cardFaceElementId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/nav/${cardFaceElementId}`).pipe(
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
