import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { assertObjectsMatch } from '../../../../../../utils/checks.utils';
import { CardEditorCardDto } from '../../../../models/card';
import { CardFaceElementPerCardFace } from '../../../../models/card-face-element';
import { DEFAULT_CARD_EDITOR_FACE_STYLE, getBlankCardTemplate } from '../../../../utils/card-editor.constants';
import { DEFAULT_USER_ID } from '../../../../utils/user.constants';
import { CardEditorPreviewService } from './card-editor-preview.service';

describe('CardEditorPreviewService', () => {
  let service: CardEditorPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(CardEditorPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setCardEditorCardDto', () => {
    it('should match card face elements per card face', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.cardEditorCardFacesDto[0].cardFaceElementsPerCardFace = [
        {
          cardFaceElementPerCardFaceId: "1999551276978798592",
          cardFaceElement: {
            cardFaceElementType: "Image",
            cardFaceElementId: "1999551276269961217",
            style: {
              styleId: "1999551276269961216",
            }
          },
          dndItem: {
            dndItemId: "1999551277347897344",
            isDraggable: false,
            isDroppable: false,
            isRotatable: false
          },
          dndPosition: {
            dndPositionId: "1999551277368868864",
            x: 73.625,
            y: 381.70312
          }
        },
        {
          cardFaceElementPerCardFaceId: "1999551277389840384",
          cardFaceElement: {
            cardFaceElementType: "Rt",
            cardFaceElementId: "1999551277154959361",
            style: {
              styleId: "1999551277154959360",
            }
          },
          dndItem: {
            dndItemId: "1999551277347897344",
            isDraggable: false,
            isDroppable: false,
            isRotatable: false
          },
          dndPosition: {
            dndPositionId: "1999551277368868864",
            x: 73.625,
            y: 381.70312
          }
        }
      ]

      service.setCardEditorCardDto(dto);

      let map: Map<string, CardFaceElementPerCardFace[]> = new Map<string, CardFaceElementPerCardFace[]>([
        ['currentCardFaceElementsPerCardFace', service.getCurrentCardFaceElementsPerCardFace()],
        ['currentCardEditorCardFaceDto', service.currentCardEditorCardFaceDto.cardFaceElementsPerCardFace],
        ['cardEditorCardDto', service.cardEditorCardDto.cardEditorCardFacesDto[service.getCurrentCardFaceId()].cardFaceElementsPerCardFace]
      ]);

      assertObjectsMatch(map, `setCardEditorCardDto - assertCardFaceElementsPerCardFace`);
    })
  })

  describe('isFlipped', () => {
    it('should return false when current card face index is 0', () => {
      service.cardEditorCardDto.card.currentCardFaceId = "0";
      expect(service.isFlipped()).toBe(false);
    });

    it('should return true when current card face index is 1', () => {
      service.cardEditorCardDto.card.currentCardFaceId =  "1";
      expect(service.isFlipped()).toBe(true);
    });

    it('should return true for any non-zero index', () => {
      service.cardEditorCardDto.card.currentCardFaceId =  "2";
      expect(service.isFlipped()).toBe(true);
    });
  });

  describe('setCardName', () => {
    it('should set card name', () => {
      let testName: string = 'Test Card Name';
      service.setCardName(testName);
      expect(service.cardEditorCardDto.card.cardName).toBe(testName);
    });

    it('should update existing card name', () => {
      service.cardEditorCardDto.card.cardName = 'Old Name';
      let newName: string = 'New Name';
      service.setCardName(newName);
      expect(service.cardEditorCardDto.card.cardName).toBe(newName);
    });
  });

  describe('getCardName', () => {
    it('should return card name', () => {
      let cardName: string = "My Card";
      service.cardEditorCardDto.card.cardName = cardName;
      expect(service.getCardName()).toBe(cardName);
    });

    it('should return empty string if card name is empty', () => {
      service.cardEditorCardDto.card.cardName = '';
      expect(service.getCardName()).toBe('');
    });
  });

  describe('getCardTagNames', () => {
    it('should return card tag names array', () => {
      service.cardEditorCardDto.tagNames = ['tag1', 'tag2', 'tag3'];
      expect(service.getCardTagNames()).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return empty array when no tags', () => {
      service.cardEditorCardDto.tagNames = [];
      expect(service.getCardTagNames()).toEqual([]);
    });
  });

  describe('setCurrentCardFaceIndex', () => {
    it('should toggle from 0 to 1', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);

      service.cardEditorCardDto.card.currentCardFaceId = "0";
      service.setCurrentCardFaceId();
      expect(service.cardEditorCardDto.card.currentCardFaceId).toBe("1");
    });

    it('should toggle from 1 to 0', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID)

      service.cardEditorCardDto.card.currentCardFaceId =  "1";
      service.setCurrentCardFaceId();
      expect(service.cardEditorCardDto.card.currentCardFaceId).toBe("0");
    });
  });
});