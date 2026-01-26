import { TestBed } from '@angular/core/testing';

import { CardEditorFacePreviewFlipService } from './card-editor-face-preview-flip.service';

describe('CardEditorFacePreviewFlipService', () => {
  let service: CardEditorFacePreviewFlipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorFacePreviewFlipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
