import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardEditorInfoService {
  private onInfoUrlChange$$: Subject<string> = new Subject<string>();
  onInfoUrlChange$: Observable<string> = this.onInfoUrlChange$$.asObservable();
    
  setOnInfoUrlChange(url: string) {
    this.onInfoUrlChange$$.next(url);
  }
}
