import { TestBed } from '@angular/core/testing';

import { DndCardBoardService } from './dnd-card-board.service';

describe('DndCardBoardService', () => {
  let service: DndCardBoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DndCardBoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
