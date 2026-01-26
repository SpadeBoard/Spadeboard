import { TestBed } from '@angular/core/testing';

import { CardFaceEditorPreviewAttributesService } from './card-face-editor-preview-attributes.service';

describe('CardFaceEditorPreviewAttributesService', () => {
  let service: CardFaceEditorPreviewAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardFaceEditorPreviewAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
