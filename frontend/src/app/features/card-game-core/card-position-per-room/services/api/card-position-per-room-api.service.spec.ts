import { TestBed } from '@angular/core/testing';

import { CardPositionPerRoomApiService } from './card-position-per-room-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardPositionPerRoomApiService', () => {
  let service: CardPositionPerRoomApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardPositionPerRoomApiService>(CardPositionPerRoomApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
