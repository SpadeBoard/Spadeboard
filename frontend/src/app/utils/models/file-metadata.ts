export interface FileMetadata {
  fileMetadataId: string;
  volumePath: string;
  fileName: string;
  fileMetadataStatus: FileMetadataStatus;
  creationDate: Date | null;
}

export enum FileMetadataStatus {
  Pending = 'Pending',
  Attached = 'Attached',
  Orphaned = 'Orphaned'
}
