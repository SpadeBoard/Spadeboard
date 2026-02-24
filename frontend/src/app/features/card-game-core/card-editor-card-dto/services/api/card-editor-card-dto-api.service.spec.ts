import { TestBed } from '@angular/core/testing';

import { CardEditorCardDtoApiService } from './card-editor-card-dto-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorCardDtoApiService', () => {
  let service: CardEditorCardDtoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardEditorCardDtoApiService>(CardEditorCardDtoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
