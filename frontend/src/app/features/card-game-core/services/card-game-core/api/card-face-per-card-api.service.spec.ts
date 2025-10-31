import { TestBed } from '@angular/core/testing';

import { CardFacePerCardApiService } from './card-face-per-card-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFacePerCardApiService', () => {
  let service: CardFacePerCardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardFacePerCardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
