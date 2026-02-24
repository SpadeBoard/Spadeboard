import { TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignElementAttributesService } from './card-editor-controls-design-element-attributes.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorControlsDesignElementAttributesService', () => {
  let service: CardEditorControlsDesignElementAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardEditorControlsDesignElementAttributesService>(CardEditorControlsDesignElementAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
