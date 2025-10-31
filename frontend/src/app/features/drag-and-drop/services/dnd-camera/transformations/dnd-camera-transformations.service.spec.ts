import { TestBed } from '@angular/core/testing';

import { DndCameraTransformationsService } from './dnd-camera-transformations.service';

describe('DndCameraTransformationsService', () => {
  let service: DndCameraTransformationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DndCameraTransformationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
