import { TestBed } from '@angular/core/testing';

import { CardFaceElementRtService } from './card-face-element-rt.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceElementRtService', () => {
  let service: CardFaceElementRtService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardFaceElementRtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
