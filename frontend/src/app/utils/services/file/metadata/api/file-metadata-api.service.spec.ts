import { TestBed } from '@angular/core/testing';

import { FileMetadataApiService } from './file-metadata-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('FileMetadataApiService', () => {
  let service: FileMetadataApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<FileMetadataApiService>(FileMetadataApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
