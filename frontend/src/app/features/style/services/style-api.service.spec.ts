import { TestBed } from '@angular/core/testing';

import { StyleApiService } from './style-api.service';

describe('StyleApiService', () => {
  let service: StyleApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StyleApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
