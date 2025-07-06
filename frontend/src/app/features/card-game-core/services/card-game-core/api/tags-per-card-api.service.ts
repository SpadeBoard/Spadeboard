import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagsPerCardApiService {
  constructor() { }

  private http = inject(HttpClient);

  private apiUrl = `${environment.hostServerUrl}/api/TagsPerCard`;
  
  deleteByTagNamesAndCardId$(tagNames: string[], cardId: string): Observable<void> {
    let params: HttpParams = new HttpParams({ fromObject: { tagNames } }); // tagNames will be repeated in the query string
    return this.http.delete<void>(`${this.apiUrl}/tag-names/${cardId}`, { params });
  }
}
