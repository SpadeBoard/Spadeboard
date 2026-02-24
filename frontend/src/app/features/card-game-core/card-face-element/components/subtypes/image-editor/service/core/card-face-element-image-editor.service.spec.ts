import { TestBed } from '@angular/core/testing';

import { CardFaceElementImageEditorService } from './card-face-element-image-editor.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceElementImageEditorService', () => {
  let service: CardFaceElementImageEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardFaceElementImageEditorService>(CardFaceElementImageEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
