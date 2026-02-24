import { TestBed } from '@angular/core/testing';

import { CardFaceElementImageModalService } from './card-face-element-image-modal.service';

describe('CardFaceElementImageModalService', () => {
  let service: CardFaceElementImageModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<CardFaceElementImageModalService>(CardFaceElementImageModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
