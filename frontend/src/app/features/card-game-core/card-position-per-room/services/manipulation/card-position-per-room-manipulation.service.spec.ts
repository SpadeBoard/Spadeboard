import { TestBed } from '@angular/core/testing';

import { CardPositionPerRoomManipulationService } from './card-position-per-room-manipulation.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardPositionPerRoomManipulationService', () => {
  let service: CardPositionPerRoomManipulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardPositionPerRoomManipulationService>(CardPositionPerRoomManipulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
