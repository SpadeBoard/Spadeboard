import { TestBed } from '@angular/core/testing';

import { CardFaceApiService } from './card-face-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceApiService', () => {
  let service: CardFaceApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardFaceApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
