import { TestBed } from '@angular/core/testing';

import { CardFaceElementApiService } from './card-face-element-api.service';

describe('CardFaceElementApiService', () => {
  let service: CardFaceElementApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardFaceElementApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
