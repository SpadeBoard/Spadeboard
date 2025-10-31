import { TestBed } from '@angular/core/testing';

import { FileAuthenticationPerExportedCardApiService } from './file-authentication-per-exported-card-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('FileAuthenticationPerExportedCardApiService', () => {
  let service: FileAuthenticationPerExportedCardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(FileAuthenticationPerExportedCardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
