import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, Subscription } from 'rxjs';
import { unsubscription } from '../../../../../../../../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsElementLayeringAttributesService {
  constructor() { }

  private onBringToFront$$: Subject<void> = new Subject<void>();
  public readonly onBringToFront$: Observable<void> = this.onBringToFront$$.asObservable();

  private onSendToBack$$: Subject<void> = new Subject<void>();
  public readonly onSendToBack$: Observable<void> = this.onSendToBack$$.asObservable();

  public setOnBringToFront(): void {
    this.onBringToFront$$.next();
  }

  public setOnSendToBack(): void {
    this.onSendToBack$$.next();
  }

  public onCardFaceElementsLayering(fn: Function, destroyRef: DestroyRef): Subscription {
    return merge(
      this.onBringToFront$.pipe(
        map(() => 'front')
      ),
      this.onSendToBack$.pipe(
        map(() => 'back')
      )
    ).pipe(
      takeUntilDestroyed(destroyRef)
    )
      .subscribe((operation: string) => {
        if (operation !== 'front' && operation !== 'back') {
          console.error('No operation to card face element layer');
          return;
        }

        fn(operation);
      })
  }

  public cardFaceElementsLayeringChange(fn: (operation: string) => void, cardFaceElementLayering$$: Subscription | null, destroyRef: DestroyRef): Subscription {
    unsubscription(cardFaceElementLayering$$);
    return this.onCardFaceElementsLayering((operation: string) => fn(operation), destroyRef);
  }
}
