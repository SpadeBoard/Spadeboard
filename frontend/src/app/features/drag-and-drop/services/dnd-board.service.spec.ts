import { TestBed } from '@angular/core/testing';

import { DndBoardService } from './dnd-board.service';

describe('DndBoardService', () => {
  let service: DndBoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DndBoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
