import { TestBed } from '@angular/core/testing';

import { SpatialTransformationMatrixService } from './spatial-transformation-matrix.service';

describe('SpatialTransformationMatrixService', () => {
  let service: SpatialTransformationMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpatialTransformationMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
