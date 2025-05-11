import { HttpClient } from '@angular/common/http';
import { inject, Injectable, ResourceLoaderParams, ResourceRef } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { rxResource } from '@angular/core/rxjs-interop';
import { Style } from '../models/style';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StyleApiService {
  private http = inject(HttpClient);

  // TODO: Replace with actual API url from the config
  private apiUrl = `${environment.hostServerUrl}/api/Styles`;

  constructor() { }

  /**
   * Key Components
   * request: This is an optional function that returns an object containing signals or observables16. It defines the parameters that the loader function will use. When these signals change, it triggers a reload of the resource.
   * loader: This is a required function that performs the actual data fetching16. It receives the values from the request function and returns an Observable. This is where you typically make HTTP requests or perform other asynchronous operations.
   * 
   * Return Value
   * rxResource returns a ResourceRef object with the following properties and methods79:
   * result$: An Observable that emits the current state of the resource.
   * loading: A signal indicating whether the resource is currently loading.
   * error: A signal containing any error that occurred during loading.
   * data: A signal containing the loaded data.
   * reload(): A method to manually trigger a reload of the resource.
   * update(): A method to update the current data locally.
   * set(): A method to set new data locally.
   * 
   * The first type argument specifies the return type of the loader function
   * The second type argument  indicates that the loader function's parameters'
   * 
   */
  getStyles: ResourceRef<Style[] | undefined> = rxResource<Style[], []>({
    loader: () => this.http.get<Style[]>(this.apiUrl)
  });

  // Read (get one style)
  getStyle: ResourceRef<Style | undefined> = rxResource<Style, [number]>({
    loader: (id) => this.http.get<Style>(`${this.apiUrl}/${id}`)
  });

  // Create
  createStyle: ResourceRef<Style | undefined>  = rxResource<Style, [Omit<Style, 'id'>]>({
    loader: (style) => this.http.post<Style>(this.apiUrl, style)
  });

  // Update
  /*updateStyle: ResourceRef<Style | undefined>  = rxResource<Style, {styleId: string, style: Partial<Style>}>({
    request: () => ({styleId, style}),
    loader: (params: ResourceLoaderParams<{styleId: string, style: Partial<Style>}>) => this.http.put<Style>(`${this.apiUrl}/${styleId}`, style)
  });*/

  // Delete
  deleteStyle: ResourceRef<void | undefined>  = rxResource<void, [number]>({
    loader: (id) => this.http.delete<void>(`${this.apiUrl}/${id}`)
  });
}
