import { TestBed } from '@angular/core/testing';

import { CardGameCoreService } from './card-game-core.service';

describe('CardGameCoreService', () => {
  let service: CardGameCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardGameCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
