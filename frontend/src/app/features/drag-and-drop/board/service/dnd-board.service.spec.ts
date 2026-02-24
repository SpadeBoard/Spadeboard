import { TestBed } from '@angular/core/testing';

import { DndBoardService } from './dnd-board.service';
import { provideHttpClient } from '@angular/common/http';

describe('DndBoardService', () => {
  let service: DndBoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<DndBoardService>(DndBoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
