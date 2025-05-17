export interface FileMetadata {
    fileMetadataId: string;
    volumePath: string;
    fileName: string;
    lastUsedAt?: Date | null;
}
