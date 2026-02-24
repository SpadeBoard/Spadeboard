import { TestBed } from '@angular/core/testing';

import { CardsCollectionService } from './cards-collection.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardsCollectionService', () => {
  let service: CardsCollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardsCollectionService>(CardsCollectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
