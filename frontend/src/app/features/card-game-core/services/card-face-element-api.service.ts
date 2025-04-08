import { inject, Injectable, ResourceLoaderParams, ResourceRef } from '@angular/core';
import { CardFaceElement, CardFaceElementDto } from '../models/card-face-element';
import { rxResource } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementApiService {

  private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/CardFaceElements`;
  
  constructor() { }

  getCardFaceElements(cardFaceId?: number): Observable<CardFaceElement[] | CardFaceElementDto[] | undefined> {
    if (cardFaceId !== undefined) {
      return this.http.get<CardFaceElementDto[]>(`${this.apiUrl}/CardFace/dto/${cardFaceId}`);
      // return this.http.get<CardFaceElement[]>(`${this.apiUrl}/dto/${cardFaceId}`);
    }
    
    return this.http.get<CardFaceElement[]>(`${this.apiUrl}`);
  }

  /*getCardFaceElements(): ResourceRef<CardFaceElement[] | undefined>;
  getCardFaceElements(cardFaceId: number): ResourceRef<CardFaceElement[] | undefined>;
  getCardFaceElements(cardFaceId?: number): ResourceRef<CardFaceElement[] | undefined> {
    return rxResource<CardFaceElement[] | undefined, { cardFaceId: number | undefined }>({
      request: () => ({ cardFaceId }),
      loader: (params: ResourceLoaderParams<{
        cardFaceId: number | undefined
      }>): Observable<CardFaceElement[] | undefined> => {

        // TODO: Modify so that you can get the card face elements specifically by card face ID
        return this.http.get<CardFaceElement[]>(`${this.apiUrl}`);
      }
    });
  }

  getCardFaceElement(cardFaceElementId: number): ResourceRef<CardFaceElement | undefined> {
    return rxResource<CardFaceElement | undefined, { cardFaceElementId: number}>({
      request: () => ({ cardFaceElementId }),
      loader: (params: ResourceLoaderParams<{
        cardFaceElementId: number
      }>): Observable<CardFaceElement | undefined> => {

        // TODO: Modify so that you can get the card face elements specifically by card face ID
        return this.http.get<CardFaceElement | undefined>(`${this.apiUrl}/${params.request.cardFaceElementId}`);
      }
    });
  }

  createCardFaceElement(cardFaceElement: Omit<CardFaceElement, 'cardFaceElementId'>): ResourceRef<CardFaceElement | undefined> {
    return rxResource<CardFaceElement, { cardFaceElement: Omit<CardFaceElement, 'cardFaceElementId'>}>({
      request: () => ({ cardFaceElement }),
      loader: (params: ResourceLoaderParams<{
        cardFaceElement: Omit<CardFaceElement, 'cardFaceElementId'>
      }>): Observable<CardFaceElement> => {
        return this.http.post<CardFaceElement>(`${this.apiUrl}`, params.request.cardFaceElement);
      }
    });
  }

  updateCardFaceElement(cardFaceElement: CardFaceElement): ResourceRef<CardFaceElement | undefined> {
    return rxResource<CardFaceElement, { cardFaceElement: CardFaceElement}>({
      request: () => ({ cardFaceElement }),
      loader: (params: ResourceLoaderParams<{
        cardFaceElement: CardFaceElement;
      }>): Observable<CardFaceElement> => {
        return this.http.put<CardFaceElement>(`${this.apiUrl}/${params.request.cardFaceElement.cardFaceElementId}`, params.request.cardFaceElement);
      }
    });
  }

  deleteCardFaceElement(cardFaceElementId: number): ResourceRef<void | undefined> {
    return rxResource<void | undefined, { cardFaceElementId: number}>({
      request: () => ({ cardFaceElementId }),
      loader: (params: ResourceLoaderParams<{
        cardFaceElementId: number;
      }>): Observable<void | undefined> => {
        return this.http.delete<void | undefined>(`${this.apiUrl}/${params.request.cardFaceElementId}`);
      }
    });
  }*/

  // TODO: Call the card face element stored procedure
}
