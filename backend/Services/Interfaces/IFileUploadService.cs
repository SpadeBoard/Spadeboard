namespace Services
{
    public interface IFileUploadService
    {
        Task<FileStream?> GetFileAsync(string fileName, string volumePath);

        public Task<string?> UploadFileAsync(IFormFile formFile, float maxLength, string volumePath);
        
        public Task<FileStream?> GetCardFaceFileAsync(string fileName);

        public Task<string?> UploadCardFaceFileAsync(IFormFile formFile);
    
        public void ConvertBlobToFile(byte[] blob, string filePath);
    }
}