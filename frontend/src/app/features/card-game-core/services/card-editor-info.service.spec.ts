import { TestBed } from '@angular/core/testing';

import { CardEditorInfoService } from './card-editor-info.service';

describe('CardEditorInfoService', () => {
  let service: CardEditorInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
