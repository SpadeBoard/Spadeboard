import { TestBed } from '@angular/core/testing';

import { CardFacePerCardApiService } from './card-face-per-card-api.service';

describe('CardFacePerCardApiService', () => {
  let service: CardFacePerCardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardFacePerCardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
