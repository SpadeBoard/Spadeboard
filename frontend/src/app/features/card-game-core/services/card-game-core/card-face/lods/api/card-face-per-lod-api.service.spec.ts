import { TestBed } from '@angular/core/testing';

import { CardFacePerLodApiService } from './card-face-per-lod-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFacePerLodApiService', () => {
  let service: CardFacePerLodApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardFacePerLodApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
