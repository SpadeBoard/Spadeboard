import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject } from 'rxjs';
import { operate } from '../../../../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignRteService {
  private enableRte$$ = new Subject<{id: string, text :string}>();
  public readonly enableRte$: Observable<{id: string, text :string}> = this.enableRte$$.asObservable();

  private disableRte$$ = new Subject<{id: string, text :string}>();
  public readonly disableRte$: Observable<{id: string, text :string}> = this.disableRte$$.asObservable();

  private onRteTextChange$$ = new Subject<string>();
  public readonly onRteTextChange$: Observable<string> = this.onRteTextChange$$.asObservable();


  constructor() { }

  public setOnEnableRte(id: string, text: string): void {
    this.enableRte$$.next({id, text});
  }

  public setOnDisableRte(id: string, text: string): void {
    this.disableRte$$.next({id, text});
  }

  public setOnRteTextChange(text: string): void {
    this.onRteTextChange$$.next(text);
  }

  public onRteTextChange(fn: Function): void {
    this.onRteTextChange$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((text: string) => {
        fn(text);
      })
  }

  public onStatusToggle(rteStatusOperations: Map<string, Function>): void {
    merge(
      this.enableRte$.pipe(
        map((emitted: {id: string, text :string}) => ({ operation: 'enable', emitted }))
      ),
      this.disableRte$.pipe(
        map((emitted: {id: string, text :string}) => ({ operation: 'disable', emitted }))
      )
    )
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((result: ({ operation: string, emitted: {id: string, text :string} })) => {
        operate(result, rteStatusOperations);
      }
      );
  }
}
