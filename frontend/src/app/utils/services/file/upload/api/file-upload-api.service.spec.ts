import { TestBed } from '@angular/core/testing';

import { FileUploadApiService } from './file-upload-api.service';

describe('FileUploadApiService', () => {
  let service: FileUploadApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<FileUploadApiService>(FileUploadApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
