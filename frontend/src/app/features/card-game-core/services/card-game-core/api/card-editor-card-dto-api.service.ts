import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { CardEditorCardDto } from '../../../models/card';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CardEditorCardDtoApiService {
  private http: HttpClient = inject(HttpClient);
  
    // TODO: Replace with actual API url from the config
    private apiUrl: string = `${environment.hostServerUrl}/api/CardEditorCardDtos`;

  constructor() { }

  getCardEditorCardDtoByCardId$(cardId: string): Observable<CardEditorCardDto | undefined> {
    return this.http.get<CardEditorCardDto>(`${this.apiUrl}/${cardId}`);
  }

  createCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    return this.http.post<CardEditorCardDto>(`${this.apiUrl}/`, cardEditorCardDto);
  }

  updateCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    // CHECKME: Do we need to update the owner ID too? But it's not gonna change
    return this.http.put<CardEditorCardDto>(`${this.apiUrl}/${cardEditorCardDto.card.cardId}`, cardEditorCardDto);
  }

  deleteCardEditorCardDtoByCardId$(cardId: string): Observable<void | undefined> {
    return this.http.delete<void>(`${this.apiUrl}/${cardId}`);
  }
}
