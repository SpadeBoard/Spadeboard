import { TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignImageService } from './card-editor-controls-design-image.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorControlsDesignImageService', () => {
  let service: CardEditorControlsDesignImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardEditorControlsDesignImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
