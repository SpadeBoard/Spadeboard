import { TestBed } from '@angular/core/testing';

import { FileMetadataService } from './file-metadata.service';
import { provideHttpClient } from '@angular/common/http';

describe('FileMetadataService', () => {
  let service: FileMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject<FileMetadataService>(FileMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
