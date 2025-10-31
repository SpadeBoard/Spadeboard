import { inject, Injectable } from '@angular/core';
import { FileMetadataService } from '../../metadata/facade/file-metadata.service';
import { FileMetadata, FileMetadataStatus } from '../../../../models/file-metadata';
import { FileUploadApiService } from '../api/file-upload-api.service';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly fileUploadApiService: FileUploadApiService = inject(FileUploadApiService);

  private readonly fileMetadataService: FileMetadataService = inject(FileMetadataService);

  constructor() { }

  public duplicateFile$(fileMetadata: FileMetadata, fileType: string, filePath: string, fileMetadataStatus: FileMetadataStatus = FileMetadataStatus.Pending): Observable<FileMetadata | undefined> {
    return this.fileUploadApiService.replaceFilePath$(fileMetadata.fileName, fileType).pipe(
      switchMap((result: { id: string | undefined }) => {
        if (!result.id) return of(undefined);
        return this.fileMetadataService.createFileMetadata$(filePath, result.id, fileMetadataStatus);
      })
    );
  }

  public duplicateFiles$(filesMetadata: FileMetadata[], fileType: string, filePath: string, fileMetadataStatus: FileMetadataStatus = FileMetadataStatus.Pending) {
    let fileNames: string[] = filesMetadata.map((fm: FileMetadata) => (fm.fileName));

    return this.fileUploadApiService.replaceFilePaths$(fileNames, fileType).pipe(
      switchMap((result: string[]) => {
        return this.fileMetadataService.createFilesMetadata$(filePath, result, fileMetadataStatus);
      })
    )
  }
}
