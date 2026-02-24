import { TestBed } from '@angular/core/testing';

import { CardEditorModalService } from './card-editor-modal.service';

describe('CardEditorModalService', () => {
  let service: CardEditorModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<CardEditorModalService>(CardEditorModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
