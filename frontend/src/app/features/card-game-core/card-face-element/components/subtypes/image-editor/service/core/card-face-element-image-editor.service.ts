import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { operate } from '../../../../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardFaceElementImageEditorService {
  private enableImageEditor$$: Subject<string> = new Subject<string>();
  public readonly enableImageEditor$: Observable<string> = this.enableImageEditor$$.asObservable();

  private uploadImage$$: Subject<string> = new Subject<string>();
  public readonly uploadImage$: Observable<string> = this.uploadImage$$.asObservable();

  private disableImageEditor$$: Subject<string> = new Subject<string>();
  public readonly disableImageEditor$: Observable<string> = this.disableImageEditor$$.asObservable();

  constructor() { }

  public setOnEnableImageEditor(id: string): void {
    this.enableImageEditor$$.next(id);
  }

   public setUploadImage(src: string): void {
    this.uploadImage$$.next(src);
  }

  public setDisableImageEditor(src: string): void {
    this.disableImageEditor$$.next(src);
  }

  public statusToggleSubscription(imageEditorStatusOperations: Map<string, Function>, destroyRef: DestroyRef): Subscription {
    return merge(
      this.enableImageEditor$.pipe(
        map((id: string) => ({ operation: 'enable', emitted: id }))
      ),
      this.uploadImage$.pipe(
        map((src: string) => ({ operation: 'upload', emitted: src }))
      ),
      this.disableImageEditor$.pipe(
        map((src: string) => ({ operation: 'disable', emitted: src }))
      )
    )
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((result: ({ operation: string, emitted: string }) | string) => {
        operate(result, imageEditorStatusOperations);
      });
  }
}
