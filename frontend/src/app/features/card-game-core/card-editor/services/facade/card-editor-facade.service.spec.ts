import { TestBed } from '@angular/core/testing';

import { CardEditorFacadeService } from './card-editor-facade.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorFacadeService', () => {
  let service: CardEditorFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<CardEditorFacadeService>(CardEditorFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

   describe('shouldDeleteItems', () => {
    it('should delete when there are card face elements per card face ids to delete', () => {
      expect(service.shouldDeleteItems(['2008222447328821248'])).toBe(true);
    });
  });
});
