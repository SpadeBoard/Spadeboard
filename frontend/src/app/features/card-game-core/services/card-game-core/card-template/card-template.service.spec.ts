import { TestBed } from '@angular/core/testing';

import { CardTemplateService } from './card-template.service';
import { provideHttpClient } from '@angular/common/http';
import { Card, CardEditorCardDto } from '../../../models/card';
import { DEFAULT_CARD_EDITOR_FACE_STYLE, getBlankCardTemplate } from '../../../utils/card-editor.constants';
import { DEFAULT_USER_ID } from '../../../utils/user.constants';
import { Tag } from '../../../../tagging-system/models/tag';

describe('CardTemplateService', () => {
  let service: CardTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(CardTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clear', () => {
    it('tag names to delete should be cleared', () => {
      service.tagNamesToDelete = [
        'Template'
      ];

      service.clear();
      expect(service.tagNamesToDelete).toEqual([]);
    });
  })

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
          currentCardFaceId: 0
        },
        {
          cardId: '2',
          cardName: '',
          currentCardFaceId: 0
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
        currentCardFaceId: 0
      }
      dto.tagNames = ['Template'];

      let cards: Card[] = [
        {
          cardId: '1',
          cardName: '',
          currentCardFaceId: 0
        },
        {
          cardId: '2',
          cardName: '',
          currentCardFaceId: 0
        }
      ];
      spyOn(service, 'isCardTemplate').and.returnValue(false);

      let result: Card[] = service.removeCardTemplate(dto, cards);
      expect(result.length).toBe(1);
      expect(result.some(c => c.cardId === '1')).toBeFalse();
    });
  });

  describe('addTag', () => {
    it('should add new tag if not exists', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.card = {
        cardId: '1',
        cardName: '',
        currentCardFaceId: 0
      }
      let tag: Tag = {
        tagName: 'Test',
        tagId: '1'
      };

      let tagNamesToDelete: string[] = ['Old'];

      service.addTag(tag, dto, tagNamesToDelete);
      expect(dto.tagNames).toContain('Test');
    });

    it('should throw error if already has tag', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.card = {
        cardId: '1',
        cardName: '',
        currentCardFaceId: 0
      }
      dto.tagNames = ['Test'];
      let tag: Tag = {
        tagName: 'Test',
        tagId: '1'
      };
      expect(() => service.addTag(tag, dto)).toThrowError();
    });
  });

  describe('updateTag', () => {
    it('should update tag at index and push old tag to delete list', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.card = {
        cardId: '1',
        cardName: '',
        currentCardFaceId: 0
      }
      dto.tagNames = ['Old'];
      let tag: Tag = {
        tagName: 'New',
        tagId: '1'
      };
      let tagNamesToDelete: string[] = [];

      service.updateTag(0, tag, dto, tagNamesToDelete);
      expect(dto.tagNames[0]).toBe('New');
      expect(tagNamesToDelete).toContain('Old');
    });

    it('should throw if index does not exist', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.card = {
        cardId: '1',
        cardName: '',
        currentCardFaceId: 0
      }
      let tag: Tag = {
        tagName: 'New',
        tagId: '1'
      };
      expect(() => service.updateTag(0, tag, dto)).toThrowError();
    });
  });

  describe('deleteTag', () => {
    it('should remove tag and push to delete list', () => {
      let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
      dto.card = {
        cardId: '1',
        cardName: '',
        currentCardFaceId: 0
      }
      dto.tagNames = ['ToRemove'];
      let tag: Tag = {
        tagName: 'ToRemove',
        tagId: '1'
      };
      let toDelete: string[] = [];

      service.deleteTag(tag, dto, toDelete);
      expect(dto.tagNames.includes('ToRemove')).toBeFalse();
      expect(toDelete).toContain('ToRemove');
    });
  });
});