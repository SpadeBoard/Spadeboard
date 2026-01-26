import { TestBed } from '@angular/core/testing';

import { CardEditorFacePreviewOperationsService } from './card-editor-face-preview-operations.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorFacePreviewOperationsService', () => {
  let service: CardEditorFacePreviewOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardEditorFacePreviewOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

    describe('shouldDeleteItems', () => {
    it('should delete when there are card face elements per card face ids to delete', () => {
      expect(service.shouldDeleteItems(['2008222447328821248'])).toBe(true);
    });
  });
});
