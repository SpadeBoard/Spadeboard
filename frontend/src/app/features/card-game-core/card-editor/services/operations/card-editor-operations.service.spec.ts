import { TestBed } from '@angular/core/testing';

import { CardEditorOperationsService } from './card-editor-operations.service';

describe('cardEditorOperationsService', () => {
  let service: CardEditorOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<CardEditorOperationsService>(CardEditorOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
