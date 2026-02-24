import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.production';
import { DndItem } from '../models/dnd-item';

@Injectable({
  providedIn: 'root'
})
export class DndItemApiService {
  private readonly http: HttpClient = inject<HttpClient>(HttpClient);

  // TODO: Replace with actual API url from the config
  private readonly apiUrl: string = `${environment.hostServerUrl}/api/DndItems`;

  constructor() { }

  public getDndItems$(): Observable<DndItem[] | undefined> {
    return this.http.get<DndItem[]>(this.apiUrl);
  }

  public getDndItem$(id: string): Observable<DndItem | undefined> {
    return this.http.get<DndItem>(`${this.apiUrl}/${id}`);
  }

  public createDndItem$(item: DndItem): Observable<DndItem | undefined> {
    return this.http.post<DndItem>(this.apiUrl, item);
  }

  public updateDndItem$(item: DndItem): Observable<void | undefined> {
    return this.http.put<void>(`${this.apiUrl}/${item.dndItemId}`, item);
  };

  public deleteDndItem$(id: string): Observable<void | undefined> {
    return  this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}