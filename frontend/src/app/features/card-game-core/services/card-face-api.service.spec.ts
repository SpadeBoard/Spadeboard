import { TestBed } from '@angular/core/testing';

import { CardFaceApiService } from './card-face-api.service';

describe('CardFaceApiService', () => {
  let service: CardFaceApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardFaceApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
