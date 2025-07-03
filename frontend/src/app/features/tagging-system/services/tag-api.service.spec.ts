import { TestBed } from '@angular/core/testing';

import { TagApiService } from './tag-api.service';

describe('TagApiService', () => {
  let service: TagApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
