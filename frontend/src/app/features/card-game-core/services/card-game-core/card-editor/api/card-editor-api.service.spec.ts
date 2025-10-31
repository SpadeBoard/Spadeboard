import { TestBed } from '@angular/core/testing';

import { CardEditorApiService } from './card-editor-api.service';

describe('CardEditorApiService', () => {
  let service: CardEditorApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
