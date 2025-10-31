import { FileMetadata, FileMetadataStatus } from "./models/file-metadata";

export function areAllFileMetadataOfStatus(filesMetadata: FileMetadata[], status: FileMetadataStatus): boolean {
    return filesMetadata.every((fm: FileMetadata) => fm.fileMetadataStatus === status);
}