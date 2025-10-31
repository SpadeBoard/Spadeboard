import { TestBed } from '@angular/core/testing';

import { CardFaceElementDndService } from './card-face-element-dnd.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceElementDndService', () => {
  let service: CardFaceElementDndService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardFaceElementDndService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
