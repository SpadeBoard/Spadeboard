import { TestBed } from '@angular/core/testing';

import { CardFacePerLodApiService } from './card-face-per-lod-api.service';

describe('CardFacePerLodApiService', () => {
  let service: CardFacePerLodApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardFacePerLodApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
