import { TestBed } from '@angular/core/testing';

import { CardPositionPerRoomService } from './card-position-per-room.service';

describe('CardPositionPerRoomService', () => {
  let service: CardPositionPerRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardPositionPerRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
