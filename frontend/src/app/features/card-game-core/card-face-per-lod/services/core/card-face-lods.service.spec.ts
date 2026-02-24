import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { FileMetadata, FileMetadataStatus } from '../../../../../utils/models/file-metadata';
import { DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH } from '../../../card-face/constants/card-face.constants';
import { CardFaceLodsService } from './card-face-lods.service';

describe('CardFaceLodsService', () => {
  let service: CardFaceLodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject<CardFaceLodsService>(CardFaceLodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clear', () => {
    it('orphaned file metadata should be cleared', () => {
      service.orphanedFileMetadata = [
        {
          fileMetadataId: '182736451928374656', 
          volumePath:  DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH,
          fileName: crypto.randomUUID(),
          fileMetadataStatus: FileMetadataStatus.Orphaned,
          creationDate: new Date('2025-12-14T10:00:00Z'),
        },
        {
          fileMetadataId: '182736451928374657', 
          volumePath:  DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH,
          fileName: crypto.randomUUID(),
          fileMetadataStatus: FileMetadataStatus.Orphaned,
          creationDate: new Date('2025-12-10T08:30:00Z'),
        },
      ];

      service.clear();
      expect(service.orphanedFileMetadata).toEqual([]);
    });

    it('orphaned file metadata with any non-orphaned status should throw an error', () => {
      service.orphanedFileMetadata = [
        {
          fileMetadataId: '182736451928374656', 
          volumePath:  DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH,
          fileName: crypto.randomUUID(),
          fileMetadataStatus: FileMetadataStatus.Attached,
          creationDate: new Date('2025-12-14T10:00:00Z'),
        },
        {
          fileMetadataId: '182736451928374657', 
          volumePath:  DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH,
          fileName: crypto.randomUUID(),
          fileMetadataStatus: FileMetadataStatus.Orphaned,
          creationDate: new Date('2025-12-10T08:30:00Z'),
        },
      ];

      expect(service.clear).toThrowError();
    });
  })

  describe('orphanFileMetadata', () => {
    it('should orphaned file metadata', () => {
      service.orphanedFileMetadata = [
        {
          fileMetadataId: '182736451928374656', 
          volumePath:  DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH,
          fileName: crypto.randomUUID(),
          fileMetadataStatus: FileMetadataStatus.Attached,
          creationDate: new Date('2025-12-14T10:00:00Z'),
        },
        {
          fileMetadataId: '182736451928374657', 
          volumePath:  DEFAULT_CARD_FACE_THUMBNAILS_VOLUME_PATH,
          fileName: crypto.randomUUID(),
          fileMetadataStatus: FileMetadataStatus.Attached,
          creationDate: new Date('2025-12-10T08:30:00Z'),
        },
      ];

      service.orphanFileMetadata();
      expect(service.orphanedFileMetadata.every((fm: FileMetadata) => fm.fileMetadataStatus === FileMetadataStatus.Orphaned)).toBe(true);
    });
  })
});
