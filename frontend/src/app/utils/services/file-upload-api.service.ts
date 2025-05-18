import { inject, Injectable, ResourceRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadApiService {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.hostServerUrl}/api/Files`;

  constructor() { }

  getFile$(fileName: string, type?: string): Observable<Blob | undefined> {
    switch (type)
    {
      case "card-face":
        return this.http.get(`${this.apiUrl}/card-face/${fileName}`, { responseType: 'blob' });
      case "card-face-element-image":
        return this.http.get(`${this.apiUrl}/card-face-element-image/${fileName}`, { responseType: 'blob' });
        default:
        return this.http.get(`${this.apiUrl}/${fileName}`, { responseType: 'blob' });
    }
  }

  replaceFilePath$(fileName: string, type?: string): Observable<{ id: string | undefined; }> {
    switch (type) {
      case "card-face":
        return this.http.put<{id: string}>(`${this.apiUrl}/card-face-image-path/${fileName}`, fileName);
      case "card-face-element-image":
        return this.http.put<{id: string}>(`${this.apiUrl}/card-face-element-image-path/${fileName}`, fileName);
      default:
         return this.http.put<{id: string}>(`${this.apiUrl}/card-face-element-image-path/${fileName}`, fileName);
    }
  }

  // TODO: Do switch statement here
  
  uploadFile$(formData: FormData, type?: string): Observable<{ id: string }> {
    let headers = new HttpHeaders().set('Content-Type', 'multipart/form-data');
    
    switch (type)
    {
      case "card-face":
        return this.http.post<{id: string}>(`${this.apiUrl}/card-face`, formData);
      case "card-face-element-image":
        return this.http.post<{id: string}>(`${this.apiUrl}/card-face-element-image`, formData);
      default:
        return this.http.post<{id: string}>(`${this.apiUrl}`, formData/*, {headers}*/);
    }
  }

  replaceFile(formData: FormData, fileName: string, type?: string): Observable<{
    id: string;
  }> {
    switch (type)
    {
      case "card-face":
        return this.http.put<{id: string}>(`${this.apiUrl}/card-face/${fileName}`, formData);
      case "card-face-element-image":
        return this.http.put<{id: string}>(`${this.apiUrl}/card-face-element-image/${fileName}`, formData);
      default:
        return this.http.put<{id: string}>(`${this.apiUrl}`, formData/*, {headers}*/);
    }
  }

  /*
  deleteFile(fileId: number): ResourceRef<void | undefined> {
    return rxResource<void, [number]>({
      request: () => [fileId],
      loader: ([fileId]) => {
          return this.http.delete<void>(`${this.apiUrl}/${fileId}`);
        }
      }
    );
  }*/
}
