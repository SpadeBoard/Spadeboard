import { TestBed } from '@angular/core/testing';

import { CardPositionPerRoomApiService } from './card-position-per-room-api.service';

describe('CardPositionPerRoomApiService', () => {
  let service: CardPositionPerRoomApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardPositionPerRoomApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
