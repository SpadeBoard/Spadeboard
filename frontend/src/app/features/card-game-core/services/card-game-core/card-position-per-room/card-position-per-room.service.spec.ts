import { TestBed } from '@angular/core/testing';

import { CardPositionPerRoomService } from './card-position-per-room.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardPositionPerRoomService', () => {
  let service: CardPositionPerRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardPositionPerRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
