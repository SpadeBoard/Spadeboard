import { TestBed } from '@angular/core/testing';

import { CardFaceElementRteService } from './card-face-element-rte.service';

describe('CardFaceElementRteService', () => {
  let service: CardFaceElementRteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<CardFaceElementRteService>(CardFaceElementRteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
