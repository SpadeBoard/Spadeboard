import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { operate } from '../../../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementRteService {
  private enableRte$$ = new Subject<{id: string, text :string}>();
  public readonly enableRte$: Observable<{id: string, text :string}> = this.enableRte$$.asObservable();

  private disableRte$$ = new Subject<{id: string, text :string}>();
  public readonly disableRte$: Observable<{id: string, text :string}> = this.disableRte$$.asObservable();

  private rteTextChange$$ = new Subject<string>();
  public readonly rteTextChange$: Observable<string> = this.rteTextChange$$.asObservable();

  constructor() { }

  public setOnEnableRte(id: string, text: string): void {
    this.enableRte$$.next({id, text});
  }

  public setOnDisableRte(id: string, text: string): void {
    this.disableRte$$.next({id, text});
  }

  public setRteTextChange(text: string): void {
    this.rteTextChange$$.next(text);
  }

  public rteTextChange(fn: Function, destroyRef: DestroyRef): void {
    this.rteTextChange$
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((text: string) => {
        fn(text);
      })
  }

  public statusToggleSubscription(rteStatusOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.enableRte$.pipe(
        map((emitted: {id: string, text :string}) => ({ operation: 'enable', emitted }))
      ),
      this.disableRte$.pipe(
        map((emitted: {id: string, text :string}) => ({ operation: 'disable', emitted }))
      )
    )
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((result: ({ operation: string, emitted: {id: string, text :string} })) => {
        operate(result, rteStatusOperations);
      }
      );
  }
}
