import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FileAuthenticationPerExportedCard } from '../../../models/file-authentication-per-exported-card';
import { CardEditorCardDto } from '../../../card-editor/models/card-editor-card-dto';

@Injectable({
  providedIn: 'root'
})
export class FileAuthenticationPerExportedCardApiService {
  private readonly http = inject<HttpClient>(HttpClient);
    
  private readonly apiUrl = `${environment.hostServerUrl}/api/FileAuthenticationPerExportedCard`;
    
  constructor() { }

  public isValidImport$(cardEditorCardDto: CardEditorCardDto): Observable<boolean> {
    if (!cardEditorCardDto) {
      console.warn("No card editor card dto to check");
      return of(false);
    }

    return this.http.post<boolean>(`${this.apiUrl}/is-valid-import`, cardEditorCardDto);
  }

  public createFileAuthenticationPerExportedCard$(fileAuthenticationPerExportedCard: FileAuthenticationPerExportedCard): Observable<FileAuthenticationPerExportedCard| undefined> {
      if (!fileAuthenticationPerExportedCard) {
        return of(undefined);
      } 
      return this.http.post<FileAuthenticationPerExportedCard>(this.apiUrl, fileAuthenticationPerExportedCard);
    }
}
