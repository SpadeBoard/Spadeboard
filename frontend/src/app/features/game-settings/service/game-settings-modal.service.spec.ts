import { TestBed } from '@angular/core/testing';

import { GameSettingsModalService } from './game-settings-modal.service';

describe('GameSettingsModalService', () => {
  let service: GameSettingsModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSettingsModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
