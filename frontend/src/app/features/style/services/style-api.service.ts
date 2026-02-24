import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class StyleApiService {
  private readonly http: HttpClient = inject<HttpClient>(HttpClient);

  // TODO: Replace with actual API url from the config
  private readonly apiUrl: string = `${environment.hostServerUrl}/api/Styles`;

  constructor() { }
}
