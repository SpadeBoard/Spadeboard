import { TestBed } from '@angular/core/testing';

import { CardFaceEditorPreviewElementsService } from './card-face-editor-preview-elements.service';

describe('CardFaceEditorPreviewElementsService', () => {
  let service: CardFaceEditorPreviewElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardFaceEditorPreviewElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
