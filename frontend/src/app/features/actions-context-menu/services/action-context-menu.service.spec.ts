import { TestBed } from '@angular/core/testing';

import { ActionContextMenuService } from './action-context-menu.service';

describe('ActionContextMenuService', () => {
  let service: ActionContextMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionContextMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
