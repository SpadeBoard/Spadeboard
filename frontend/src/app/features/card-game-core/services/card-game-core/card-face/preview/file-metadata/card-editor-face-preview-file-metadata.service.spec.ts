import { TestBed } from '@angular/core/testing';

import { CardEditorFacePreviewFileMetadataService } from './card-editor-face-preview-file-metadata.service';

describe('CardEditorFacePreviewFileMetadataService', () => {
  let service: CardEditorFacePreviewFileMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorFacePreviewFileMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
