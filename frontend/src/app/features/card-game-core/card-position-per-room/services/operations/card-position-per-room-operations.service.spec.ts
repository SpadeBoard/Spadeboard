import { TestBed } from '@angular/core/testing';

import { CardPositionPerRoomOperationsService } from './card-position-per-room-operations.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardPositionPerRoomOperationsService', () => {
  let service: CardPositionPerRoomOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardPositionPerRoomOperationsService>(CardPositionPerRoomOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
