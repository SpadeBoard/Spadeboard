import { TestBed } from '@angular/core/testing';

import { CardRotationService } from './card-rotation.service';

describe('CardRotationService', () => {
  let service: CardRotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardRotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
