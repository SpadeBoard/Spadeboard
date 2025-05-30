import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { inject, Injectable, ResourceRef } from '@angular/core';

import { DndItem } from '../models/dnd-item';
import { environment } from '../../../../environments/environment.production';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DndItemApiService {
  private http = inject(HttpClient);

  // TODO: Replace with actual API url from the config
  private apiUrl = `${environment.hostServerUrl}/api/DndItems`;

  constructor() { }

  // Read (Get all DndItems)
  getDndItems$(): Observable<DndItem[] | undefined> {
    return this.http.get<DndItem[]>(this.apiUrl);
  }

  // Read (get one dndItem)
  getDndItem$(id: string): Observable<DndItem | undefined> {
    return this.http.get<DndItem>(`${this.apiUrl}/${id}`);
  }

  // Create
  createDndItem$(item: DndItem): Observable<DndItem | undefined> {
    return this.http.post<DndItem>(this.apiUrl, item);
  }

  // Update
  updateDndItem$(item: DndItem): Observable<void | undefined> {
    return this.http.put<void>(`${this.apiUrl}/${item.dndItemId}`, item);
  };

  // Delete
  deleteDndItem$(id: string): Observable<void | undefined> {
    return  this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}