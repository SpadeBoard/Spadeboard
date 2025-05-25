import { TestBed } from '@angular/core/testing';

import { GameRoomApiService } from './game-room-api.service';

describe('GameRoomApiService', () => {
  let service: GameRoomApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameRoomApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
