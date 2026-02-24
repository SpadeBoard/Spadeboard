import { Injectable, signal, WritableSignal } from '@angular/core';
import { DEFAULT_USER_ID } from '../constants/user.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public $userId: WritableSignal<string> = signal<string>(DEFAULT_USER_ID);

  constructor() { }

  public setUserId(userId: string): void {
    this.$userId.set(userId);
  }
}
