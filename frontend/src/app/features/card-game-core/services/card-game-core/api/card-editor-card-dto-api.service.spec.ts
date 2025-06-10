import { TestBed } from '@angular/core/testing';

import { CardEditorCardDtoApiService } from './card-editor-card-dto-api.service';

describe('CardEditorCardDtoApiService', () => {
  let service: CardEditorCardDtoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardEditorCardDtoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
