import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Card } from '../../../models/card';

@Injectable({
  providedIn: 'root'
})
export class TagsPerCardApiService {
  constructor() { }

  private http: HttpClient = inject(HttpClient);

  private readonly apiUrl: string = `${environment.hostServerUrl}/api/TagsPerCard`;
  
  public deleteByTagNamesAndCardId$(tagNames: string[], cardId: string): Observable<void> {
    let params: HttpParams = new HttpParams({ fromObject: { tagNames } }); // tagNames will be repeated in the query string
    return this.http.delete<void>(`${this.apiUrl}/tag-names/${cardId}`, { params });
  }

  public getCardTemplatesByOwnerId$(ownerId: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/owner/${ownerId}`);
  }
}
