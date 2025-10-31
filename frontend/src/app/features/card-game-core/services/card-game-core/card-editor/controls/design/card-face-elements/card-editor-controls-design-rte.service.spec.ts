import { TestBed } from '@angular/core/testing';

import { CardEditorControlsDesignRteService } from './card-editor-controls-design-rte.service';

describe('CardEditorControlsDesignRteService', () => {
  let service: CardEditorControlsDesignRteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorControlsDesignRteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
