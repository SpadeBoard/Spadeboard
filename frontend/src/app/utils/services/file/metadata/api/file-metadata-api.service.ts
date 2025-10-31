import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { FileMetadata } from '../../../../models/file-metadata';

@Injectable({
  providedIn: 'root'
})
export class FileMetadataApiService {
  private readonly http: HttpClient = inject(HttpClient);

  private readonly apiUrl: string = `${environment.hostServerUrl}/api/FileMetadata`;

  constructor() { }

  public createFileMetadata$(fileMetadata: FileMetadata): Observable<FileMetadata | undefined> {
    return this.http.post<FileMetadata>(this.apiUrl, fileMetadata);
  }

  public createFilesMetadata$(filesMetadata: FileMetadata[]): Observable<FileMetadata[] | undefined> {
    return this.http.post<FileMetadata[]>(`${this.apiUrl}/batch`, filesMetadata);
  }

  public updateFileMetadata$(fileMetadataId: string, fileMetadata: Partial<FileMetadata>): Observable<FileMetadata | undefined> {
    return this.http.put<FileMetadata>(`${this.apiUrl}/${fileMetadataId}`, fileMetadata);
  }

  public updateAllFileMetadata$(fileMetadata: FileMetadata[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/`, fileMetadata);
  }
}
