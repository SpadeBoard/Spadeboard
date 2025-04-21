import { TestBed } from '@angular/core/testing';

import { GameRoomService } from './game-room.service';

describe('GameRoomService', () => {
  let service: GameRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
