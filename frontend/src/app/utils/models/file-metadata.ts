/*
The card Export / Import process should be a Pass-by-Value process, rather than a Pass-by-Reference 
- If I export a card, hand that file to a friend, and he imports the card into his own library, that new card should be completely separate from my original card, just with the same content on it (card face elements, text, images, etc.). 
- If I delete or change the original, that doesn't affect the new card.
*/
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
