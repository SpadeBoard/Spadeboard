import { Injectable, signal, WritableSignal } from '@angular/core';
import { DEFAULT_USER_ID } from '../../utils/user.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // https://medium.com/@jaydeepvpatil225/observables-and-subjects-in-angular-a4d73dfa5bb
  // Dynamic multicast delegates?
  public $userId: WritableSignal<string> = signal<string>(DEFAULT_USER_ID);

  // https://medium.com/@dev.ashaysawarkar/communicating-between-sibling-components-in-angular-using-rxjs-subject-4e5382dcca34
  // Use subjects to communicate between siblings?

  constructor() { }

  public setUserId(userId: string): void {
    this.$userId.set(userId);
  }
}
