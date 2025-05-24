import { TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignCardFaceAttributesService } from './card-editor-controls-design-card-face-attributes.service';

describe('CardEditorControlsDesignCardFaceAttributesService', () => {
  let service: CardEditorControlsDesignCardFaceAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorControlsDesignCardFaceAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
