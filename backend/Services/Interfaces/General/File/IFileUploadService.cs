namespace Services
{
    public interface IFileUploadService
    {
        Task<FileStream?> GetFileAsync(string fileName, string volumePath);

        public Task<string?> UploadFileAsync(IFormFile formFile, float maxLength, string volumePath);

        public Task<bool> ReplaceFileAsync(IFormFile formFile, string volumePath, string fileName, float maxLength);
        
        public Task<FileStream?> GetCardFaceFileAsync(string fileName);

        public Task<FileStream?> GetCardFaceElementImageFileAsync(string fileName);

        public Task<string?> UploadCardFaceFileAsync(IFormFile formFile);
    
        public Task<string?> UploadCardFaceElementImageFileAsync(IFormFile formFile);

        public Task<bool> ReplaceCardFaceFileAsync(IFormFile formFile, string fileName);

        public Task<bool> ReplaceCardFaceElementImageFileAsync(IFormFile formFile, string fileName);
        
        public Task DeleteFileAsync(string volumePath, string fileName);

        public Task DeleteCardFaceFileAsync(string fileName);

        public Task DeleteCardFaceElementImageFileAsync(string fileName);
        
        /*public void ConvertBlobToFile(byte[] blob, string filePath);*/
    }
}