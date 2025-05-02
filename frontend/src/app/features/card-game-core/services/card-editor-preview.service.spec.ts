import { TestBed } from '@angular/core/testing';

import { CardEditorPreviewService } from './card-editor-preview.service';

describe('CardEditorPreviewService', () => {
  let service: CardEditorPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
