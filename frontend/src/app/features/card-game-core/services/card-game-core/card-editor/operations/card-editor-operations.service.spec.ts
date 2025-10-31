import { TestBed } from '@angular/core/testing';

import { CardEditorOperationsService } from './card-editor-operations.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorOperationsService', () => {
  let service: CardEditorOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardEditorOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
