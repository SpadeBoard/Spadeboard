import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { operate } from '../../../../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignImageService {
  private enableImageEditor$$ = new Subject<string>();
  public readonly enableImageEditor$: Observable<string> = this.enableImageEditor$$.asObservable();

  private disableImageEditor$$ = new Subject<string>();
  public readonly disableImageEditor$: Observable<string> = this.disableImageEditor$$.asObservable();

  constructor() { }

  public setOnEnableImageEditor(id: string): void {
    this.enableImageEditor$$.next(id);
  }

  public setDisableImageEditor(src: string): void {
    this.disableImageEditor$$.next(src);
  }

  public onStatusToggle(imageEditorStatusOperations: Map<string, Function>): Subscription {
    return merge(
      this.enableImageEditor$.pipe(
        map((id: string) => ({ operation: 'enable', emitted: id }))
      ),
      this.disableImageEditor$.pipe(
        map((src: string) => ({ operation: 'disable', emitted: src }))
      )
    )
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe((result: ({ operation: string, emitted: string }) | string) => {
        operate(result, imageEditorStatusOperations);
      });
  }
}
