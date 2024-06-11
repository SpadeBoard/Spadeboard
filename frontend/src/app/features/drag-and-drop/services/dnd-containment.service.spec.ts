import { TestBed } from '@angular/core/testing';

import { DndContainmentService } from './dnd-containment.service';

describe('DndContainmentService', () => {
  let service: DndContainmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DndContainmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
