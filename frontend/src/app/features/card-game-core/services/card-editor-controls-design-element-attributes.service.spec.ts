import { TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignElementAttributesService } from './card-editor-controls-design-element-attributes.service';

describe('CardEditorControlsDesignElementAttributesService', () => {
  let service: CardEditorControlsDesignElementAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorControlsDesignElementAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
