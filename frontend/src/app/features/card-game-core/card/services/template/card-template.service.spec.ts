import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { CardEditorCardDto } from '../../../card-editor/models/card-editor-card-dto';
import { Card } from '../../models/card';
import { DEFAULT_CARD_EDITOR_FACE_STYLE, getBlankCardTemplate } from '../../../card-editor/constants/card-editor.constants';
import { DEFAULT_USER_ID } from '../../../../user/constants/user.constants';
import { CardTemplateService } from './card-template.service';

describe('CardTemplateService', () => {
  let service: CardTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject<CardTemplateService>(CardTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isCardTemplate', () => {
    it('should return true if tagNames contain "Template"', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.tagNames = ['Template'];
      expect(service.isCardTemplate(dto)).toBeTrue();
    });

    it('should return true if tagNames contain "template" regardless of case', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.tagNames = ['template'];
      expect(service.isCardTemplate(dto)).toBeTrue();
    });

    it('should return false if "Template" does not exist', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.tagNames = ['Example'];
      expect(service.isCardTemplate(dto)).toBeFalse();
    });
  });

  describe('addCardTemplate', () => {
    it('should add card when isCardTemplate returns true', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.tagNames = ['Template'];
      let cards: Card[] = [];

      spyOn(service, 'isCardTemplate').and.returnValue(true);
      let result: boolean = service.addCardTemplate(dto, cards);

      expect(cards.length).toBe(1);
      expect(result).toBeTrue();
    });

    it('should not add card when not a template', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.tagNames = ['Alucard'];
      let cards: Card[] = [];

      spyOn(service, 'isCardTemplate').and.returnValue(false);
      let result: boolean = service.addCardTemplate(dto, cards);

      expect(cards.length).toBe(0);
      expect(result).toBeFalse();
    });
  });

  describe('removeCardTemplate', () => {
    it('should remove card by cardId (string)', () => {
      let cards: Card[] = [
        {
          cardId: '1',
          cardName: '',
          currentCardFaceId: "0"
        },
        {
          cardId: '2',
          cardName: '',
          currentCardFaceId: "0"
        }
      ];

      let result: Card[] = service.removeCardTemplate('1', cards);
      expect(result.length).toBe(1);
      expect(result[0].cardId).toBe('2');
    });

    it('should remove card when given CardEditorCardDto', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.card = {
        cardId: '1',
        cardName: '',
        currentCardFaceId: "0"
      }
      dto.tagNames = ['Template'];

      let cards: Card[] = [
        {
          cardId: '1',
          cardName: '',
          currentCardFaceId: "0"
        },
        {
          cardId: '2',
          cardName: '',
          currentCardFaceId: "0"
        }
      ];
      spyOn(service, 'isCardTemplate').and.returnValue(false);

      let result: Card[] = service.removeCardTemplate(dto, cards);
      expect(result.length).toBe(1);
      expect(result.some(c => c.cardId === '1')).toBeFalse();
    });
  });
});