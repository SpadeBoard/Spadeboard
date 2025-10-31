import { TestBed } from '@angular/core/testing';

import { CardRotationService } from './card-rotation.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardRotationService', () => {
  let service: CardRotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardRotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
