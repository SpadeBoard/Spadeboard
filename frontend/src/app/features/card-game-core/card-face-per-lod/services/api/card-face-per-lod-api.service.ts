import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardFacePerLodApiService {
  private readonly http: HttpClient = inject<HttpClient>(HttpClient);

  private readonly apiUrl: string = `${environment.hostServerUrl}/api/CardFacePerLod`;

  constructor() { }

  public getFileMetadataFileNamesByCardFace$(cardFaceId: string): Observable<string[] | undefined> {
   return this.http.get<string[]>(`${this.apiUrl}/card-face/${cardFaceId}`);
  }
}
