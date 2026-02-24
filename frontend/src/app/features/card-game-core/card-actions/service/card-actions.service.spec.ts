import { TestBed } from '@angular/core/testing';

import { CardActionsService } from './card-actions.service';

describe('CardActionsService', () => {
  let service: CardActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<CardActionsService>(CardActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
