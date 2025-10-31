import { TestBed } from '@angular/core/testing';

import { CardService } from './card.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardService', () => {
  let service: CardService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
