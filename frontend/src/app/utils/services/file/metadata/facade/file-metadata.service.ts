import { inject, Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { FileMetadata, FileMetadataStatus } from '../../../../models/file-metadata';
import { FileMetadataApiService } from '../api/file-metadata-api.service';

@Injectable({
  providedIn: 'root'
})
export class FileMetadataService {
  private readonly fileMetadataApiService: FileMetadataApiService = inject(FileMetadataApiService);

  private orphan$$: Subject<void> = new Subject<void>();
  public readonly orphan$: Observable<void> = this.orphan$$.asObservable();

  constructor() { }

  public orphan(): void {
    this.orphan$$.next();
  }

  // CHECKME: Would this work, the FileMetadataApiService being passed through part
  public createFilesMetadata$(volumePath: string, fileNames: string[], fileMetadataStatus: FileMetadataStatus): Observable<FileMetadata[] | undefined> {
    let filesMetadata: FileMetadata[] = [];

    fileNames.forEach((fileName) => {
      let fileMetadata: FileMetadata = {
        fileMetadataId: '0',
        volumePath: volumePath,
        fileName: fileName,
        creationDate: new Date(),
        fileMetadataStatus: fileMetadataStatus
      };

      filesMetadata.push(fileMetadata);
    });

    return this.fileMetadataApiService.createFilesMetadata$(filesMetadata).pipe(
      tap(result => {
        if (!result) throw new Error(`${this.fileMetadataApiService.createFilesMetadata$.name}: File metadata wasn't able to be created`);

        // console.log(`Created file metadata: ${JSON.stringify(result, null, 2)}`);
      })
    );
  }

  public createFileMetadata$(volumePath: string, fileName: string, fileMetadataStatus: FileMetadataStatus): Observable<FileMetadata | undefined> {
    let fileMetadata: FileMetadata = {
      fileMetadataId: '0',
      volumePath: volumePath,
      fileName: fileName,
      creationDate: new Date(),
      fileMetadataStatus: fileMetadataStatus
    };

    return this.fileMetadataApiService.createFileMetadata$(fileMetadata).pipe(
      tap(result => {
        if (!result) throw new Error(`${this.fileMetadataApiService.createFileMetadata$.name}: File metadata wasn't able to be created`);
        // console.log(`Created file metadata: ${JSON.stringify(result, null, 2)}`);
      })
    );
  }

  // CHECKME: Does this need to be an observable?
  public markFileMetadata(filesMetadata: FileMetadata[], fileMetadataStatus: FileMetadataStatus = FileMetadataStatus.Orphaned): void {
    if (filesMetadata.length <= 0) {
      console.warn('No files to orphan.');
      return;
    }

    filesMetadata.forEach((fm: FileMetadata) => {
      fm.fileMetadataStatus = fileMetadataStatus;
    });

    this.fileMetadataApiService.updateAllFileMetadata$(filesMetadata).subscribe({
      next: () => filesMetadata = [],
      error: err => console.error(`${this.fileMetadataApiService.updateAllFileMetadata$.name}`, err)
    });
  }
}
