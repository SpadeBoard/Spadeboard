import { TestBed } from '@angular/core/testing';

import { CardApiService } from './card-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardApiService', () => {
  let service: CardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardApiService>(CardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
