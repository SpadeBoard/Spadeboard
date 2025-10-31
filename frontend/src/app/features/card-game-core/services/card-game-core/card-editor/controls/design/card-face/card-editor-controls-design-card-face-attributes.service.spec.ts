import { TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignCardFaceAttributesService } from './card-editor-controls-design-card-face-attributes.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorControlsDesignCardFaceAttributesService', () => {
  let service: CardEditorControlsDesignCardFaceAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardEditorControlsDesignCardFaceAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
