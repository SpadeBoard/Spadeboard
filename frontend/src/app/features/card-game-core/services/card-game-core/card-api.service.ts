import { HttpClient } from '@angular/common/http';
import { inject, Injectable, ResourceLoaderParams, ResourceRef } from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';

import { Card, CardEditorCardDto } from '../../models/card';
import { environment } from '../../../../../environments/environment';
import { DndItem } from '../../../drag-and-drop/models/dnd-item';
import { map, Observable, of } from 'rxjs';
import { CardFace } from '../../models/card-face';
import { Style } from '../../../style/models/style';

@Injectable({
  providedIn: 'root'
})
export class CardApiService {
  // https://www.reddit.com/r/angular/comments/1et5oqu/comment/libru76/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

  private http: HttpClient = inject(HttpClient);

  // TODO: Replace with actual API url from the config
  private apiUrl: string = `${environment.hostServerUrl}/api/Cards`;
  private apiCompositeUrl: string = `${environment.hostServerUrl}/api/card_all_attributes`;

  // TODO: Function signatures for overloading
  
  constructor() { }

  // NOTE: Pass in objects, not tuples, remember
  // FIXME: Pass in objects, not tuples, for all rxResource
  // https://medium.com/@davidepassafaro/angular-resource-and-rxresource-apis-what-you-need-to-know-aa1c178e43e9
  
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
  // If we're getting just cards by itself, nothing should be passed in
  // But if we're grabbing all attributes associated with all the cards, we want to have an owner ID
  
  // FIXME: Card composite must returns something different

  /*
  const cardsResource = this.cardApiService.getCards$(ownerId);

  Internally:
  request: () => [ownerId]
  */

  /*
  [
    [card_id, front_card_face_id, back_card_face_if, owner_id, is_flipped, dnd_item_id, is_draggable: true, is_droppable, dnd_position, dnd_drag_boundary, style_id],
    [card_id, front_card_face_id, back_card_face_if, owner_id, is_flipped, dnd_item_id, is_draggable: true, is_droppable, dnd_position, dnd_drag_boundary, style_id]
  ]
  */

  // TODO: Figure out where we should be returning partials?
  // Partial<Omit<Class>>:
  // If you apply Partial after Omit, all remaining properties (including those that were originally optional) will become optional.
  
  // Omit<Partial<Class>>:
  // If you apply Omit after Partial, you'll make all properties optional first, and then remove the specified properties.

  // TODO: Go into the owner function in backend, then use the service to grab all the cards associated with that owner ID then return those
  getCards$(ownerId?: string): Observable<Card[] | undefined> {
    if (ownerId !== undefined) {
      return this.http.get<Card[]>(`${this.apiUrl}/owner/${ownerId}`);
    }

    return this.http.get<Card[]>(this.apiUrl);
  }

  getCard$(cardId: number, ownerId?: string): Observable<Card | undefined> {
    if (ownerId !== undefined) {
      return this.http.get<Card>(`${this.apiUrl}/owner/${ownerId}/${cardId}`);
    }

    return this.http.get<Card>(this.apiUrl);
  }

  getCardEditorCardDto$(cardId: number): Observable<CardEditorCardDto | undefined> {
    if (cardId === undefined) {
      return of(undefined);
    } 

    return this.http.get<CardEditorCardDto>(`${this.apiUrl}/dto/${cardId}`);
  }

  // TODO: Rewrite the post, update, and delete functions for everything
  // Because it's considered generally unsafe to use rxResource with them
  // Problem is they might be necessary since/if we're using signals
  // https://stackoverflow.com/questions/47654517/property-next-does-not-exist-on-type-observableany
  /*
  For POST, UPDATE and DELETE requests, canceling might lead to unintended side effects, such as incomplete data submissions or updates. However, if you need similar functionality for these types of requests, you can use the effect() method to safely manage the operations.
  */

  createCard$(card: Card): Observable<Card | undefined> {
    if (card === undefined) {
      return of(undefined);
    } 
    // TODO: Separate properties
    return this.http.post<Card>(this.apiUrl, card);
  }

  createCardEditorCardDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    if (cardEditorCardDto === undefined) {
      return of(undefined);
    } 

    return this.http.post<CardEditorCardDto>(`${this.apiUrl}/dto`, cardEditorCardDto);
  }

  createCardEditorCardDtoFromExistingDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    if (cardEditorCardDto === undefined) {
      return of(undefined);
    } 

    return this.http.post<CardEditorCardDto>(`${this.apiUrl}/dto/create-from-existing`, cardEditorCardDto);
  }

  createCardEditorCardDtoForGameRoomFromExistingDto$(cardEditorCardDto: CardEditorCardDto): Observable<CardEditorCardDto | undefined> {
    if (cardEditorCardDto === undefined) {
      return of(undefined);
    } 

    return this.http.post<CardEditorCardDto>(`${this.apiUrl}/dto/game-room`, cardEditorCardDto);
  }

  // FIXME: Updating shouldn't be returning anything
  updateCard$(cardEditorCardDto: CardEditorCardDto): Observable<Card | CardEditorCardDto | void | undefined> {
    if (cardEditorCardDto.cardEditorCardFacesDto !== undefined ) {
      // CHECKME: Do we need to update the owner ID too? But it's not gonna change
      return this.http.put<CardEditorCardDto>(`${this.apiUrl}/dto/${cardEditorCardDto.card.cardId}`, cardEditorCardDto);
    }
    
    return this.http.put<void>(`${this.apiUrl}/${cardEditorCardDto.card.cardId}`, cardEditorCardDto.card);
  }

  deleteCard$(cardId: number, deleteAllAttributesAssociatedWithCard: boolean): Observable<void | undefined> {
    if (deleteAllAttributesAssociatedWithCard) {
      return this.http.delete<void>(`${this.apiUrl}/dto/${cardId}`);
    }
    
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
