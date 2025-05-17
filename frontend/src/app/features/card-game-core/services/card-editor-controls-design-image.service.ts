import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardEditorControlsDesignImageService {
  private onEnableImageEdtor$$ = new Subject<void>();
  onEnableImageEditor$: Observable<void> = this.onEnableImageEdtor$$.asObservable();

  private onDisableImageEditor$$ = new Subject<string>();
  onDisableImageEditor$: Observable<string> = this.onDisableImageEditor$$.asObservable();

  constructor() { }

  setOnEnableImageEditor() {
    this.onEnableImageEdtor$$.next();
  }

  setOnDisableImageEditor(src: string) {
    this.onDisableImageEditor$$.next(src);
  }
}
