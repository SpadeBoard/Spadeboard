import { TestBed } from '@angular/core/testing';

import { CardApiService } from './card-api.service';

describe('CardApiService', () => {
  let service: CardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
