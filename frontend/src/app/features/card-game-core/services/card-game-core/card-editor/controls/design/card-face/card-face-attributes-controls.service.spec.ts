import { TestBed } from '@angular/core/testing';

import { CardFaceAttributesControlsService } from './card-face-attributes-controls.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceAttributesControlsService', () => {
  let service: CardFaceAttributesControlsService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardFaceAttributesControlsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
