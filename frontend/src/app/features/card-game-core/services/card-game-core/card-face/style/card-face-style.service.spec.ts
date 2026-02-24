import { TestBed } from '@angular/core/testing';

import { CardFaceStyleService } from './card-face-style.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceStyleService', () => {
  let service: CardFaceStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardFaceStyleService>(CardFaceStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
