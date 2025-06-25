import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FileAuthenticationPerExportedCard } from '../../../models/file-authentication-per-exported-card';

@Injectable({
  providedIn: 'root'
})
export class FileAuthenticationPerExportedCardApiService {
  private http = inject(HttpClient);
    
  private apiUrl = `${environment.hostServerUrl}/api/FileAuthenticationPerExportedCard`;
    
  constructor() { }

  createFileAuthenticationPerExportedCard$(fileAuthenticationPerExportedCard: FileAuthenticationPerExportedCard): Observable<FileAuthenticationPerExportedCard| undefined> {
      if (!fileAuthenticationPerExportedCard) {
        return of(undefined);
      } 
      return this.http.post<FileAuthenticationPerExportedCard>(this.apiUrl, fileAuthenticationPerExportedCard);
    }
}
