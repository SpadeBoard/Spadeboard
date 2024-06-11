import { TestBed } from '@angular/core/testing';

import { DndItemApiService } from './dnd-item-api.service';

describe('DndItemApiService', () => {
  let service: DndItemApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DndItemApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
