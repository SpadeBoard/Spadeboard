import { ApplicationRef, ComponentRef, EnvironmentInjector, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { GameSettingsComponent } from '../component/game-settings.component';

@Injectable({
  providedIn: 'root',
})
export class GameSettingsModalService {
  private readonly environmentInjector: EnvironmentInjector = inject<EnvironmentInjector>(EnvironmentInjector);
  private readonly appRef: ApplicationRef = inject<ApplicationRef>(ApplicationRef);

  public $isGameSettingsOpen: WritableSignal<boolean> = signal<boolean>(false);

  private gameSettingsInstance: {
    host: HTMLElement;
    ref: ComponentRef<GameSettingsComponent>;
  } | undefined;
}
