import { inject, Injectable, ResourceRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class FileUploadApiService {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/file`;
  
  constructor() { }

  getFile(fileId: number): ResourceRef<string | undefined> {
    return rxResource<string, [number]>({
      request: () => [fileId],
      loader: ([fileId]) => {
          return this.http.get<string>(`${this.apiUrl}/${fileId}`);
        }
      }
    );
  }

  uploadFile(file: File): ResourceRef<string | undefined> {
    return rxResource<string, [File]>({
      request: () => [file],
      loader: ([file]) => {
          return this.http.post<string>(`${this.apiUrl}/`, {file});
        }
      }
    );
  }

  deleteFile(fileId: number): ResourceRef<void | undefined> {
    return rxResource<void, [number]>({
      request: () => [fileId],
      loader: ([fileId]) => {
          return this.http.delete<void>(`${this.apiUrl}/${fileId}`);
        }
      }
    );
  }
}
