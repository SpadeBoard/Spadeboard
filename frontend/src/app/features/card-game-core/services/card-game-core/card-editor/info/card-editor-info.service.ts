import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardEditorInfoService {
  private infoUrlChange$$: Subject<string> = new Subject<string>();
  public readonly infoUrlChange$: Observable<string> = this.infoUrlChange$$.asObservable();
    
  public setOnInfoUrlChange(url: string): void {
    this.infoUrlChange$$.next(url);
  }
}
