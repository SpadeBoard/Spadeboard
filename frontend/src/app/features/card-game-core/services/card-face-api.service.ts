import { inject, Injectable, ResourceLoaderParams, ResourceRef } from '@angular/core';
import { CardFace } from '../models/card-face';
import { CardFaceElement } from '../models/card-face-element';
import { rxResource } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';
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

  getCardFace(cardFaceId: number): Observable<CardFace | undefined> {
    return this.http.get<CardFace>(`${this.apiUrl}/dto/${cardFaceId}`);
    // return this.http.get<CardFace>(`${this.apiUrl}/${cardFaceId}`);
  }

  // ASSUMPTION:
  // All card faces are associated with a card
  /*createCardFace(cardFace: Omit<CardFace, 'cardFaceId'>): ResourceRef<CardFace | undefined>;
  createCardFace(cardFace: Omit<CardFace, 'cardFaceId'>, cardFaceElements: CardFaceElement[]): ResourceRef<{cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined>;
  createCardFace(cardFace: Omit<CardFace, 'cardFaceId'>, cardFaceElements?: CardFaceElement[]): ResourceRef<CardFace | {cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined> {
    return rxResource<CardFace | {cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined, {cardFace: Omit<CardFace, 'cardFaceId'>, cardFaceElements: CardFaceElement[] | undefined}>({
      request: () => ({cardFace, cardFaceElements}), 
      loader: (
        params: ResourceLoaderParams<{
          cardFace: Omit<CardFace, 'cardFaceId'>;
          cardFaceElements: CardFaceElement[] | undefined;
        }>): Observable<CardFace | {cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined> =>  {
        if (cardFaceElements !== undefined) {
          // Should be fine considering the only unique part of CardFace is cardFaceId, the rest is of Style
          return this.http.post<{cardFace: CardFace, cardFaceElements: CardFaceElement[]}>(`${this.apiCompositeUrl}/`, {
            body: {card_face_style_attributes: cardFace, card_face_elements: cardFaceElements}
          });
        }
        return this.http.post<CardFace>(`${this.apiUrl}/`, cardFace);
      }
    });
  }*/

  /*createCardFace(cardFace: Omit<CardFace, 'cardFaceId'>): Observable<CardFace | undefined>;
  createCardFace(cardFace: Omit<CardFace, 'cardFaceId'>, cardFaceElements: CardFaceElement[]): Observable<{ cardFace: CardFace, cardFaceElements: CardFaceElement[] } | undefined>;
  createCardFace(cardFace: Omit<CardFace, 'cardFaceId'>, cardFaceElements?: CardFaceElement[]): Observable<CardFace | { cardFace: CardFace, cardFaceElements: CardFaceElement[] } | undefined> {
    if (cardFaceElements !== undefined) {
      // Should be fine considering the only unique part of CardFace is cardFaceId, the rest is of Style
      return this.http.post<{cardFace: CardFace, cardFaceElements: CardFaceElement[]}>(`${this.apiCompositeUrl}/`, {
        body: {card_face_style_attributes: cardFace, card_face_elements: cardFaceElements}
      });
    }
    return this.http.post<CardFace>(`${this.apiUrl}/`, cardFace);
  }

  // PUT vs PATCH
  // TODO: Figure out the patch stuff
  // FIXME: Don't use partial, that's pretty dangerous
  updateCardFace(cardFace: CardFace): ResourceRef<CardFace | undefined>;
  updateCardFace(cardFace: CardFace, cardFaceElements: Partial<CardFaceElement>[]): ResourceRef<{cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined>;
  updateCardFace(cardFace: CardFace, cardFaceElements?: Partial<CardFaceElement>[]): ResourceRef<CardFace | {cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined>;
  updateCardFace(cardFace: Partial<CardFace>): ResourceRef<CardFace | undefined>;
  updateCardFace(cardFace: Partial<CardFace>, cardFaceElements: Partial<CardFaceElement>[]): ResourceRef<{cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined>;
  updateCardFace(cardFace: Partial<CardFace>, cardFaceElements?: Partial<CardFaceElement>[]): ResourceRef<CardFace | {cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined> {
    return rxResource<CardFace | {cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined, {cardFace: CardFace | Partial<CardFace>, cardFaceElements: CardFaceElement[] | Partial<CardFaceElement>[] | undefined}>({
      request: () => ({cardFace, cardFaceElements}), 
      loader:(params: ResourceLoaderParams<{
        cardFace: CardFace  | Partial<CardFace>; 
        cardFaceElements: CardFaceElement[] | Partial<CardFaceElement>[] | undefined;
      }>
      ): Observable<CardFace | {cardFace: CardFace, cardFaceElements: CardFaceElement[]} | undefined> => {
        if (cardFaceElements !== undefined) {
          return this.http.put<{cardFace: CardFace, cardFaceElements: CardFaceElement[]}>(`${this.apiCompositeUrl}/${cardFace.cardFaceId}`, {
            body: {card_face_style_attributes: cardFace, card_face_elements: cardFaceElements}});
        }

        return this.http.put<CardFace>(`${this.apiUrl}/${cardFace.cardFaceId}`, cardFace);
      }
    });
  }

  deleteCardFace(cardFaceId: number): ResourceRef<void | undefined>;
  deleteCardFace(cardFaceId: number, deleteAllAttributesAssociatedWithCardFace: boolean): ResourceRef<void | undefined>;
  deleteCardFace(cardFaceId: number, deleteAllAttributesAssociatedWithCardFace?: boolean): ResourceRef<void | undefined> {
    return rxResource<void | undefined, {cardFaceId: number, deleteAllAttributesAssociatedWithCardFace: boolean | undefined}>({
      request:() => ({cardFaceId, deleteAllAttributesAssociatedWithCardFace}),
      loader:(params: ResourceLoaderParams<{
        cardFaceId: number;
        deleteAllAttributesAssociatedWithCardFace: boolean | undefined
      }>): Observable<void | undefined> => {
        if (cardFaceId === undefined)
          return of(undefined);

        let cFI: number = cardFaceId;
        
        if (deleteAllAttributesAssociatedWithCardFace !== undefined) {
          let dAA: boolean = deleteAllAttributesAssociatedWithCardFace;
          return this.http.delete<void>(`${this.apiCompositeUrl}/${cFI}?delete_all_attributes_associated_with_card_face=${dAA}`);
        }
      
        return this.http.delete<void>(`${this.apiUrl}/${cFI}`);
      },
    })
  }*/
}
