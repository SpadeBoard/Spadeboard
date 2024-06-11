import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { inject, Injectable, ResourceRef } from '@angular/core';

import { DndItem } from '../models/dnd-item';

@Injectable({
  providedIn: 'root'
})
export class DndItemApiService {
  private http = inject(HttpClient);

  // TODO: Replace with actual API url from the config
  private apiUrl = "";

  constructor() { }

  // Read (Get all DndItems)
  getDndItems: ResourceRef<DndItem[] | undefined> = rxResource({
      loader: () => this.http.get<DndItem[]>(this.apiUrl)
  });

  // Read (get one dndItem)
  getDndItem: ResourceRef<DndItem | undefined> = rxResource<DndItem, [number]>({
    loader: (id) => this.http.get<DndItem>(`${this.apiUrl}/${id}`)
  });

  // Create
  createDndItem: ResourceRef<DndItem | undefined>  = rxResource<DndItem, [Omit<DndItem, 'id'>]>({
    loader: (dndItem) => this.http.post<DndItem>(this.apiUrl, dndItem)
  });

  // Update
  updateDndItem: ResourceRef<DndItem | undefined>  = rxResource<DndItem, [number, Partial<DndItem>]>({
    loader: ([id, dndItem]) => this.http.put<DndItem>(`${this.apiUrl}/${id}`, dndItem)
  });

  // Delete
  deleteDndItem: ResourceRef<void | undefined> = rxResource<void, [number]>({
    loader: (id) => this.http.delete<void>(`${this.apiUrl}/${id}`)
  });
}