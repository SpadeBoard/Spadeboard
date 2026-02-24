import { TestBed } from '@angular/core/testing';

import { CardEditorFaceModalService } from './card-editor-face-modal.service';

describe('CardEditorFaceModalService', () => {
  let service: CardEditorFaceModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<CardEditorFaceModalService>(CardEditorFaceModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
