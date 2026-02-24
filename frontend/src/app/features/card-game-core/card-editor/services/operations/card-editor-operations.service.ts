import { DestroyRef, ElementRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { operate } from '../../../../../utils/utils';
import { isCardEditorCardDto } from '../../../utils/card-game-core.utils';
import { CardEditorCardDto } from '../../models/card-editor-card-dto';

@Injectable({
  providedIn: 'root'
})
// TODO: Merge with CardEditorOperationsService
export class CardEditorOperationsService {
  private activateCreateCard$$: Subject<void> = new Subject<void>();
  public readonly activateCreateCard$: Observable<void> = this.activateCreateCard$$.asObservable();

  private activateSaveCard$$: Subject<void> = new Subject<void>();
  public readonly activateSaveCard$: Observable<void> = this.activateSaveCard$$.asObservable();

  private activateFlip$$: Subject<void> = new Subject<void>();
  public readonly activateFlip$: Observable<void> = this.activateFlip$$.asObservable();
  
  private completedFlip$$: Subject<void> = new Subject<void>();
  public readonly completedFlip$: Observable<void> = this.completedFlip$$.asObservable();

  private clear$$: Subject<void> = new Subject<void>();
  public readonly clear$: Observable<void> = this.clear$$.asObservable();

  private createdCardEditorCardDto$$ = new Subject<CardEditorCardDto>();
  public readonly createdCardEditorCardDto$: Observable<CardEditorCardDto> = this.createdCardEditorCardDto$$.asObservable();

  private updatedCardEditorCardDto$$ = new Subject<CardEditorCardDto>();
  public readonly updatedCardEditorCardDto$: Observable<CardEditorCardDto> = this.updatedCardEditorCardDto$$.asObservable();

  private deletedCardEditorCardDto$$: Subject<string> = new Subject<string>();
  public readonly deletedCardEditorCardDto$: Observable<string> = this.deletedCardEditorCardDto$$.asObservable();

  public importOperations: Map<string, Function> = new Map<string, Function>([
    ['create', (cardEditorCardDto: CardEditorCardDto) => this.createdCardEditorCardDto(cardEditorCardDto)],
    ['update', (cardEditorCardDto: CardEditorCardDto) => this.updatedCardEditorCardDto(cardEditorCardDto)],
    ['delete', (cardId: string) => this.deletedCardEditorCardDto(cardId)]
  ]);

  constructor() { }

  public importOperation(operation: string, object: CardEditorCardDto | string): void {
    let fn: Function | undefined = this.importOperations.get(operation);
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

  /*********** ACTIVATE ***************/
  public activateCreate(): void {
    this.activateCreateCard$$.next();
  }

  public activateSave(): void {
    this.activateSaveCard$$.next();
  }

  public activateOperationsSubscription(
    processOperationHandlers: Map<string, Function>, 
    destroyRef: DestroyRef,
    args: {
      cardEditorFace: ElementRef
    }): Subscription {
    return merge(
      this.activateCreateCard$.pipe(
        map(() => 'create')
      ),
      this.activateSaveCard$.pipe(
        map(() => 'save')
      )
    )
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((operation: string) => {
        // operate(operation, onActivatedOperations);

        operate<{
          cardEditorFace: ElementRef,
          destroyRef: DestroyRef
        }>(operation, processOperationHandlers, {...args, destroyRef});
      });
  }

  /*************************************/

  public activateFlip(): void {
    this.activateFlip$$.next();
  }

  public completedFlip(): void {
    this.completedFlip$$.next();
  }

  public processFlipSubscription(processFlipOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.activateFlip$.pipe(
        map(() => 'on')
      ),
      this.completedFlip$.pipe(
        map(() => 'post')
      )
    ).pipe(
      takeUntilDestroyed(destroyRef)
    )
      .subscribe((stage: string) => {
        operate(stage, processFlipOperations);
      });
  }

  /************ COMPLETED ****************/
  public completedOperationSubscription(cardEditorCardDtoOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
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