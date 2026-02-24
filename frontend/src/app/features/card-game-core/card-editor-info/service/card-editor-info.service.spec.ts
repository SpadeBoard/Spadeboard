import { TestBed } from '@angular/core/testing';

import { CardEditorInfoService } from './card-editor-info.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorInfoService', () => {
  let service: CardEditorInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardEditorInfoService>(CardEditorInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
