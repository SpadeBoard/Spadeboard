import { TestBed } from '@angular/core/testing';

import { AtlasExportService } from './atlas-export.service';

describe('AtlasExportService', () => {
  let service: AtlasExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtlasExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
