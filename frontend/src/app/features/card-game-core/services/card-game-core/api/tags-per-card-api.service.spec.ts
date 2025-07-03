import { TestBed } from '@angular/core/testing';

import { TagsPerCardApiService } from './tags-per-card-api.service';

describe('TagsPerCardApiService', () => {
  let service: TagsPerCardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagsPerCardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
