import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignRteService {
  private onEnableRte$$ = new Subject<string>();
  onEnableRte$: Observable<string> = this.onEnableRte$$.asObservable();
  
  private onDisableRte$$ = new Subject<void>();
  onDisableRte$: Observable<void> = this.onDisableRte$$.asObservable();

  private onRteTextChange$$ = new Subject<string>();
  onRteTextChange$: Observable<string> = this.onRteTextChange$$.asObservable();


  constructor() { }

  setOnEnableRte(text: string) {
    this.onEnableRte$$.next(text);
  }

  setOnDisableRte() {
    this.onDisableRte$$.next();
  }

  setOnRteTextChange(text: string) {
    this.onRteTextChange$$.next(text);
  }
}
