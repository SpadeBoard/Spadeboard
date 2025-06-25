import { TestBed } from '@angular/core/testing';

import { FileAuthenticationPerExportedCardApiService } from './file-authentication-per-exported-card-api.service';

describe('FileAuthenticationPerExportedCardApiService', () => {
  let service: FileAuthenticationPerExportedCardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileAuthenticationPerExportedCardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
