import { TestBed } from '@angular/core/testing';

import { CardEditorTagService } from './card-editor-tag.service';
import { CardEditorCardDto } from '../../models/card-editor-card-dto';
import { DEFAULT_CARD_EDITOR_FACE_STYLE, getBlankCardTemplate } from '../../constants/card-editor.constants';
import { Tag } from '../../../../tagging-system/models/tag';
import { provideHttpClient } from '@angular/common/http';

describe('CardEditorTagService', () => {
  let service: CardEditorTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject<CardEditorTagService>(CardEditorTagService);
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

  describe('addTag', () => {
      it('should add new tag if not exists', () => {
        let dto: CardEditorCardDto = getBlankCardTemplate(DEFAULT_CARD_EDITOR_FACE_STYLE, DEFAULT_USER_ID);
        dto.card = {
          cardId: '1',
          cardName: '',
          currentCardFaceId: "0"
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
          currentCardFaceId: "0"
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
          currentCardFaceId: "0"
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
          currentCardFaceId: "0"
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
          currentCardFaceId: "0"
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
