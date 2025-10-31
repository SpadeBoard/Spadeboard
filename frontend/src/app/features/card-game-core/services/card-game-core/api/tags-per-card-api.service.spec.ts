import { TestBed } from '@angular/core/testing';

import { TagsPerCardApiService } from './tags-per-card-api.service';
import { provideHttpClient } from '@angular/common/http';

describe('TagsPerCardApiService', () => {
  let service: TagsPerCardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(TagsPerCardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
