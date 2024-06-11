import { HttpClient } from '@angular/common/http';
import { inject, Injectable, ResourceLoaderParams, ResourceRef } from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';

import { Card, CardDto } from '../models/card';
import { environment } from '../../../../environments/environment';
import { DndItem } from '../../drag-and-drop/models/dnd-item';
import { map, Observable, of } from 'rxjs';
import { CardFace } from '../models/card-face';
import { Style } from '../../style/models/style';

@Injectable({
  providedIn: 'root'
})
export class CardApiService {
  // https://www.reddit.com/r/angular/comments/1et5oqu/comment/libru76/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
  /*
  If you are getting this error, it means that you are instanciating the class that uses it manually outside of another class constructor. There must be something wrong in the way your component is loaded. Also you don’t need to use inject in the constructor, you can also use it as a property initializer.
  */

  /* 
  ERROR RuntimeError: NG0203: rxResource() can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`. Find more at https://angular.dev/errors/NG0203
    at assertInInjectionContext (core.mjs:2487:11)
    at rxResource (rxjs-interop.mjs:326:21)
    at _CardApiService.createCard (card-api.service.ts:130:12)
    at _CardEditorComponent.onCardFaceModify (card-editor.component.ts:613:27)
    at CardEditorComponent_Template_button_click_10_listener (card-editor.component.html:95:26)
    at executeListenerWithErrorHandling (core.mjs:29464:12)
    at wrapListenerIn_markDirtyAndPreventDefault (core.mjs:29496:18)
    at HTMLButtonElement.<anonymous> (platform-browser.mjs:863:112)
    at _ZoneDelegate.invokeTask (zone.js:402:33)
    at core.mjs:6194:49
  */

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
  const cardsResource = this.cardApiService.getCards(ownerId);

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
  
  // This should be fine
  /*getCards(): ResourceRef<Card[] | undefined>;
  getCards(ownerId: string): ResourceRef<Card[] | undefined>;
  getCards(ownerId?: number): ResourceRef<Card[] | undefined> {
    return rxResource<Card[], { ownerId: string | undefined }>({
      request: () => ({ ownerId }),
      loader: (params: ResourceLoaderParams<{
        ownerId: string | undefined;
      }>) => {
        if (params.request.ownerId !== undefined) {
          return this.http.get<Card[]>(`${this.apiUrl}/owner/${ownerId}`);
        }
        return this.http.get<Card[]>(this.apiUrl);
      }
    });
  }*/

  // Read (get one card)
  /*
  [
    [card_id, front_card_face_id, back_card_face_id, owner_id, dnd_item_id, is_draggable: true, is_droppable, dnd_position, dnd_drag_boundary, style_id]
  ]
  */

  getCards(ownerId?: string): Observable<Card[] | undefined> {
    if (ownerId !== undefined) {
      return this.http.get<Card[]>(`${this.apiUrl}/owner/${ownerId}`);
    }

    return this.http.get<Card[]>(this.apiUrl);
  }

  /*getCard(cardId: number): ResourceRef<Card | undefined>;
  getCard(cardId: number, ownerId: string): ResourceRef<Card | undefined>;
  getCard(cardId: number, ownerId?: number): ResourceRef<Card | undefined> {
    return rxResource<Card | undefined, { cardId: number; ownerId?: number }>({
      request: () => ({cardId, ownerId}),  
      loader: (params: ResourceLoaderParams<{
        cardId: number;
        ownerId?: number | undefined;
      }>): Observable<Card | undefined> => {
        if (params.request.cardId === undefined) 
          // https://stackoverflow.com/questions/42704552/of-vs-from-operator
          // https://www.learnrxjs.io/learn-rxjs/operators/creation/of
          // Emit variable amount of values in a sequence and then emits a complete notification.
          return of(undefined);

        let cI: number = params.request.cardId;

        if (params.request.ownerId !== undefined) {
          let oI = params.request.ownerId;
          return this.http.get<Card>(`${this.apiCompositeUrl}/${oI}/${cI}`);
        }
        
        // TODO: Separate properties
        // Need to modify this because Card in frontend extends DndItem and Style so it's gonna miss some properties
        return this.http.get<Card>(`${this.apiUrl}/${cI}`)
      }
    });
  }*/

  /*private createCardRxResource = rxResource<Card | undefined, {card: Omit<Card, 'cardId'> | undefined, ownerId: string | undefined}>({
    request: () => ({card: undefined, ownerId: undefined}), 
    loader: (params: ResourceLoaderParams<{
      card: Omit<Card, 'cardId'> | undefined;
      ownerId?: number | undefined;
    }>): Observable<Card  | undefined> =>  {
      if (params.request.card === undefined) {
        return of(undefined);
      } 

      let c: Omit<Card, 'cardId'> = params.request.card;

      if (params.request.ownerId !== undefined) {
        let oI: number = params.request.ownerId;
        return this.http.post<Card>(`${this.apiCompositeUrl}/${oI}/`, c);
      }

      // TODO: Separate properties
      return this.http.post<Card>(this.apiUrl, c);
    }
  });*/

  // Create
  /*
  createCard(card: Omit<Card, 'cardId'>): ResourceRef<Card | undefined>;
  createCard(card: Omit<Card, 'cardId'>, ownerId: string): ResourceRef<Card | undefined>;
  createCard(card: Omit<Card, 'cardId'>, ownerId?: number): ResourceRef<Card | undefined > {
    return rxResource<Card | undefined, {card: Omit<Card, 'cardId'>, ownerId: string | undefined}>({
      request: () => ({card, ownerId}), 
      loader: (params: ResourceLoaderParams<{
        card: Omit<Card, 'cardId'>;
        ownerId?: number | undefined;
      }>): Observable<Card  | undefined> =>  {
        if (params.request.card === undefined) {
          return of(undefined);
        } 

        let c: Omit<Card, 'cardId'> = params.request.card;

        if (params.request.ownerId !== undefined) {
          let oI: number = params.request.ownerId;
          return this.http.post<Card>(`${this.apiCompositeUrl}/${oI}/`, c);
        }

        // TODO: Separate properties
        return this.http.post<Card>(this.apiUrl, c);
      }
    });
  }*/

  // TODO: Rewrite the post, update, and delete functions for everything
  // Because it's considered generally unsafe to use rxResource with them
  // Problem is they might be necessary since/if we're using signals
  // https://stackoverflow.com/questions/47654517/property-next-does-not-exist-on-type-observableany
  /*
  For POST, UPDATE and DELETE requests, canceling might lead to unintended side effects, such as incomplete data submissions or updates. However, if you need similar functionality for these types of requests, you can use the effect() method to safely manage the operations.
  */

  createCard(cardDto: CardDto): Observable<Card | CardDto | undefined> {
    if (cardDto.card === undefined) {
      return of(undefined);
    } 

    // TODO: Refactor and make this check a function on its own
    if (cardDto.frontCardFace !== undefined 
      && cardDto.backCardFace !== undefined
      // && cardDto.frontCardFaceStyle !== undefined
      // && cardDto.frontCardFaceElements !== undefined
      // && cardDto.frontCardFaceElementStyles !== undefined
      // && cardDto.backCardFaceStyle !== undefined
      // && cardDto.backCardFaceElements !== undefined)
      // && cardDto.backCardFaceElementStyles !== undefined
      // && cardDto.dndItem !== undefined
      ){
      // FIXED:
      /*
        {
            "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            "title": "One or more validation errors occurred.",
            "status": 400,
            "errors": {
                "DndItem": [
                    "The DndItem field is required."
                ]
            },
            "traceId": "00-fef42757ea5c358a966ac1890ae41229-617ebc7dabe71283-00"
        }
      
      Of course it's because you write the wrong url
      */

      return this.http.post<CardDto>(`${this.apiUrl}/dto`, {
        card: cardDto.card, 
        frontCardFace: cardDto.frontCardFace, 
        // frontCardFaceStyle: cardDto.frontCardFaceStyle,
        frontCardFaceElements: cardDto.frontCardFaceElements,
        // frontCardFaceElementStyles: cardDto.frontCardFaceElementStyles, 
        backCardFace: cardDto.backCardFace, 
        // backCardFaceStyle: cardDto.backCardFaceStyle,
        backCardFaceElements: cardDto.backCardFaceElements,
        // backCardFaceElementStyles: cardDto.backCardFaceElementStyles
      });
    }

    /*if (ownerId !== undefined) {
      return this.http.post<Card>(`${this.apiCompositeUrl}/${ownerId}/`, card);
    }*/

    // TODO: Separate properties
    return this.http.post<Card>(this.apiUrl, cardDto.card);
  }

  // FIXME: Updating shouldn't be returning anything
  updateCard(cardDto: CardDto): Observable<Card | CardDto | void | undefined> {
    if (cardDto.frontCardFace !== undefined
      && cardDto.backCardFace !== undefined
      // && cardDto.frontCardFaceStyle !== undefined
      // && cardDto.frontCardFaceElements !== undefined
      // && cardDto.frontCardFaceElementStyles !== undefined
      // && cardDto.backCardFaceStyle !== undefined
      // && cardDto.backCardFaceElements !== undefined)
      // && cardDto.backCardFaceElementStyles !== undefined
      // && cardDto.dndItem !== undefined
    ) {
      return this.http.put<void>(`${this.apiUrl}/dto/${cardDto.card.cardId}`, {
        card: cardDto.card,
        frontCardFace: cardDto.frontCardFace,
        frontCardFaceElements: cardDto.frontCardFaceElements,
        backCardFace: cardDto.backCardFace,
        backCardFaceElements: cardDto.backCardFaceElements,
      });
    }
    
    return this.http.put<void>(`${this.apiUrl}/${cardDto.card.cardId}`, cardDto.card);
  }

  deleteCard(cardId: number, deleteAllAttributesAssociatedWithCard: boolean): Observable<void | undefined> {
    if (deleteAllAttributesAssociatedWithCard) {
      return this.http.delete<void>(`${this.apiUrl}/dto/${cardId}`);
    }
    
    return this.http.delete<void>(`${this.apiUrl}/${cardId}`);
  }

  // PUT vs PATCH
  /*updateCard(card: Card): ResourceRef<Card | undefined>;
  updateCard(card: Card, ownerId: string): ResourceRef<Card | undefined>;
  updateCard(card: Card, ownerId?: number): ResourceRef<Card | undefined>;
  updateCard(card: Partial<Card>): ResourceRef<Card | undefined>;
  updateCard(card: Partial<Card>, ownerId: string): ResourceRef<Card | undefined>;
  updateCard(card: Partial<Card>, ownerId?: number): ResourceRef<Card | undefined> {
    return rxResource<Card | undefined, {card: Partial<Card> | Card, ownerId: string | undefined}>({
      request: () => ({card, ownerId}),
      loader: (params: ResourceLoaderParams<{
        card: Partial<Card> | Card;
        ownerId?: number | undefined;
      }>): Observable<Card | undefined> => {
        if (params.request.card === undefined) {
          return of(undefined);
        }

        let c: Partial<Card> | Card = params.request.card;

        if (params.request.ownerId !== undefined) {
          let oI: number = params.request.ownerId;
          return this.http.put<Card>(`${this.apiCompositeUrl}/${oI}/${c.cardId}`, c);
        }

        // TODO: Figure out patch operations

        // TODO: Separate properties
        return this.http.put<Card>(`${this.apiUrl}/${card.cardId}`, c);
      }
    });
  }*/

  // TODO: Restructure how this works because ownerId existence is confusing, it's being used for the composite url
  // Just don't use owner ID at all, use a different method to get all card IDs associated with owner then filter from there
  /*deleteCard(cardId: number): ResourceRef<void | undefined>;
  deleteCard(cardId: number, ownerId: string, deleteAllAttributesAssociatedWithCard: boolean): ResourceRef<void | undefined>;
  deleteCard(cardId: number, ownerId?: number, deleteAllAttributesAssociatedWithCard: boolean = false): ResourceRef<void | undefined> {
    return rxResource<void | undefined, {cardId: number, ownerId: string | undefined, deleteAllAttributesAssociatedWithCard: boolean | undefined}>({
      request: () => ({cardId, ownerId, deleteAllAttributesAssociatedWithCard}),
      loader: (params: ResourceLoaderParams<{
        cardId: number;
        ownerId?: number | undefined;
        deleteAllAttributesAssociatedWithCard?: boolean | undefined;
      }>): Observable<void | undefined> => {
        if (params.request.cardId === undefined) {
          return of(undefined);
        }

        let cI: number = params.request.cardId;

        if (params.request.ownerId !== undefined) {
          let oI: number = params.request.ownerId;
          let dA: boolean | undefined = params.request.deleteAllAttributesAssociatedWithCard;
          return this.http.delete<void>(`${this.apiCompositeUrl}/${oI}/${cI}?delete_all_attributes_associated_with_card=${dA}`);
        }

        // TODO: Separate properties
        return this.http.delete<void>(`${this.apiUrl}/${cI}`);
      }
    });
  }*/

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
