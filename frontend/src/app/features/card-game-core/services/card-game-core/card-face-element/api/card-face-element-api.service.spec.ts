import { TestBed } from '@angular/core/testing';

import { CardFaceElementApiService } from './card-face-element-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceElementApiService', () => {
  let service: CardFaceElementApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardFaceElementApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
