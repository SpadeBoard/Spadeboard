import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';


import { Observable, of } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Card } from '../../../models/card';

@Injectable({
  providedIn: 'root'
})
export class CardApiService {
  // https://www.reddit.com/r/angular/comments/1et5oqu/comment/libru76/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

  private http: HttpClient = inject(HttpClient);

  // TODO: Replace with actual API url from the config
  private apiUrl: string = `${environment.hostServerUrl}/api/Cards`;

  constructor() { }

  // https://medium.com/@davidepassafaro/angular-resource-and-rxresource-apis-what-you-need-to-know-aa1c178e43e9
  getCards$(ownerId?: string): Observable<Card[] | undefined> {
    if (ownerId !== undefined) {
      return this.http.get<Card[]>(`${this.apiUrl}/owner/${ownerId}`);
    }

    return this.http.get<Card[]>(this.apiUrl);
  }

  getCard$(cardId: string, ownerId?: string): Observable<Card | undefined> {
    if (ownerId !== undefined) {
      return this.http.get<Card>(`${this.apiUrl}/owner/${ownerId}/${cardId}`);
    }

    return this.http.get<Card>(this.apiUrl);
  }

  // https://stackoverflow.com/questions/47654517/property-next-does-not-exist-on-type-observableany
  /*
  For POST, UPDATE and DELETE requests, canceling might lead to unintended side effects, such as incomplete data submissions or updates. However, if you need similar functionality for these types of requests, you can use the effect() method to safely manage the operations.
  */

  createCard$(card: Card): Observable<Card | undefined> {
    if (!card) {
      return of(undefined);
    } 
    // TODO: Separate properties
    return this.http.post<Card>(this.apiUrl, card);
  }

  // FIXME: Updating shouldn't be returning anything
  updateCard$(card: Card): Observable<void | undefined> {
    return this.http.put<void>(`${this.apiUrl}/${card.cardId}`, card);
  }

  deleteCard$(cardId: string): Observable<void | undefined> {
    return this.http.delete<void>(`${this.apiUrl}/${cardId}`);
  }

  //https://www.allthingstypescript.dev/p/how-to-overload-functions-in-typescript

  /* // function signatures definition
  function doSomething(input: string): string
  function doSomething(input: string[]): string[]

  // implementation function
  function doSomething(input: string | string[]): any {
      // implementation details
      if(typeof input === "string") {
          // do something with string
      } else {
          // do something with array input
      }
  }*/
}
