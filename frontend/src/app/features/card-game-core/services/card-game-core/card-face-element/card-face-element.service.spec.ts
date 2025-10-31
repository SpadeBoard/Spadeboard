import { TestBed } from '@angular/core/testing';

import { CardFaceElementService } from './card-face-element.service';
import { provideHttpClient } from '@angular/common/http';

describe('CardFaceElementService', () => {
  let service: CardFaceElementService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient()]});
    service = TestBed.inject(CardFaceElementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clear', () => {
    it('card face elements per card face to delete IDs should be cleared', () => {
      service.cardFaceElementsPerCardFaceToDeleteIds = [
        '182736451928374650',
        '182736451928374651',
        '182736451928374652',
        '182736451928374653',
        '182736451928374654',
        '182736451928374655',
        '182736451928374656',
        '182736451928374657',
        '182736451928374658',
        '182736451928374659',
      ];

      service.clear();
      expect(service.cardFaceElementsPerCardFaceToDeleteIds).toEqual([]);
    });
  })

  describe('doesCardFaceElementPerCardFaceToDeleteExistInDatabase', () => {
    it('card face element per card face ID should be a snowflake ID', () => {
      expect(service.doesCardFaceElementPerCardFaceToDeleteExistInDatabase('2008222447328821248')).toEqual(true);
    });
  });
});