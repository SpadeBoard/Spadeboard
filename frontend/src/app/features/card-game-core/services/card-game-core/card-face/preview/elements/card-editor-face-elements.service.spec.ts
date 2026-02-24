import { TestBed } from '@angular/core/testing';

import { CardEditorFaceElementsService } from './card-editor-face-elements.service';

describe('CardEditorFaceElementsService', () => {
  let service: CardEditorFaceElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorFaceElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
