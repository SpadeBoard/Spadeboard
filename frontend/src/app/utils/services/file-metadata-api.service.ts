import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FileMetadata } from '../models/file-metadata';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileMetadataApiService {
 private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/FileMetadata`;
  
  constructor() { }

  createFileMetadata$(fileMetadata: FileMetadata): Observable<FileMetadata | undefined> {
    return this.http.post<FileMetadata>(this.apiUrl, fileMetadata);
  }

   updateFileMetadata$(fileMetadataId: string, fileMetadata: Partial<FileMetadata>): Observable<FileMetadata | undefined> {
     return this.http.put<FileMetadata>(`${this.apiUrl}/${fileMetadataId}`, fileMetadata);
  }
}
