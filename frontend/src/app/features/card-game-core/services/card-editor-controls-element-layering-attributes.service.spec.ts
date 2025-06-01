import { TestBed } from '@angular/core/testing';

import { CardEditorControlsElementLayeringAttributesService } from './card-editor-controls-element-layering-attributes.service';

describe('CardEditorControlsElementLayeringAttributesService', () => {
  let service: CardEditorControlsElementLayeringAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorControlsElementLayeringAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
