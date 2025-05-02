import { TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignImageService } from './card-editor-controls-design-image.service';

describe('CardEditorControlsDesignImageService', () => {
  let service: CardEditorControlsDesignImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorControlsDesignImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
