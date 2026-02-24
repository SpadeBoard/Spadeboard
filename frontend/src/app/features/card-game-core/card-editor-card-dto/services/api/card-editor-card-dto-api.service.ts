import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { CardEditorCardDto } from '../../../card-editor/models/card-editor-card-dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CardEditorCardDtoApiService {
  private readonly http: HttpClient = inject<HttpClient>(HttpClient);

  // TODO: Replace with actual API url from the config
  private apiUrl: string = `${environment.hostServerUrl}/api/CardEditorCardDtos`;

  constructor() { }

  public getCardEditorCardDtoByCardId$(cardId: string): Observable<CardEditorCardDto | undefined> {
    return this.http.get<CardEditorCardDto>(`${this.apiUrl}/${cardId}`);
  }

  public createCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    return this.http.post<CardEditorCardDto>(`${this.apiUrl}/`, cardEditorCardDto);
  }

  public updateCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    // CHECKME: Do we need to update the owner ID too? But it's not gonna change
    return this.http.put<CardEditorCardDto>(`${this.apiUrl}/${cardEditorCardDto.card.cardId}`, cardEditorCardDto);
  }

  public deleteCardEditorCardDtoByCardId$(cardId: string): Observable<void | undefined> {
    return this.http.delete<void>(`${this.apiUrl}/${cardId}`);
  }
}
