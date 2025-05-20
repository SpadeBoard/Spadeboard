import { TestBed } from '@angular/core/testing';

import { FileMetadataApiService } from './file-metadata-api.service';

describe('FileMetadataApiService', () => {
  let service: FileMetadataApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileMetadataApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
