import { DestroyRef, Injectable } from '@angular/core';
import { CardEditorCardDto } from '../../../../models/card';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { CardEditorPreviewService } from '../preview/card-editor-preview.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isCardEditorCardDto } from '../../../../utils/card-game-core.utils';
import { operate, stringify } from '../../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardEditorApiService {

  private clear$$: Subject<void> = new Subject<void>();
  public readonly clear$: Observable<void> = this.clear$$.asObservable();

  private createdCardEditorCardDto$$ = new Subject<CardEditorCardDto>();
  public readonly createdCardEditorCardDto$: Observable<CardEditorCardDto> = this.createdCardEditorCardDto$$.asObservable();

  private updatedCardEditorCardDto$$ = new Subject<CardEditorCardDto>();
  public readonly updatedCardEditorCardDto$: Observable<CardEditorCardDto> = this.updatedCardEditorCardDto$$.asObservable();

  private deletedCardEditorCardDto$$: Subject<string> = new Subject<string>();
  public readonly deletedCardEditorCardDto$: Observable<string> = this.deletedCardEditorCardDto$$.asObservable();

  public setOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (cardEditorCardDto: CardEditorCardDto) => this.createdCardEditorCardDto(cardEditorCardDto)],
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.updatedCardEditorCardDto(cardEditorCardDto)],
    ['delete', (cardId: string) => this.deletedCardEditorCardDto(cardId)]
  ]);

  constructor() { }

  public setOperation(operation: string, object: CardEditorCardDto | string): void {
    let fn: Function | undefined = this.setOperations.get(operation);
    if (!fn) throw new Error(`No ${operation} operation`);

    switch (operation) {
      case 'create':
      case 'update': {
        if (!isCardEditorCardDto(object)) throw new Error(`Object is not card editor card dto for ${operation}`);
        break;
      }
      case 'delete': {
        if (typeof object !== 'string') throw new Error(`Object is not string for ${operation}`);
        break;
      }
      default:
        throw new Error(`No ${operation} operation`);
    }

    fn(object);
  }

  public onOperations(cardEditorCardDtoOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.createdCardEditorCardDto$.pipe(
        map((cardEditorCardDto: CardEditorCardDto) => ({ operation: 'create', emitted: cardEditorCardDto }))
      ),
      this.updatedCardEditorCardDto$.pipe(
        map((cardEditorCardDto: CardEditorCardDto) => ({ operation: 'update', emitted: cardEditorCardDto }))
      ),
      this.deletedCardEditorCardDto$.pipe(
        map((cardId: string) => ({ operation: 'delete', emitted: cardId }))
      ),
    )
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((result: ({ operation: string, emitted: CardEditorCardDto | string })) => {
        operate(result, cardEditorCardDtoOperations);
      });
  }

  public createdCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.createdCardEditorCardDto$$.next(cardEditorCardDto);
  }

  public updatedCardEditorCardDto(cardEditorCardDto: CardEditorCardDto): void {
    this.updatedCardEditorCardDto$$.next(cardEditorCardDto);
  }

  public deletedCardEditorCardDto(cardId: string): void {
    this.deletedCardEditorCardDto$$.next(cardId);
  }

  public clear(): void {
    this.clear$$.next();
  }
}