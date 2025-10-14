namespace Services
{
    public interface IFileUploadService
    {
        Task<FileStream?> GetFileAsync(string fileName, string volumePath);

        public Task<string?> UploadFileAsync(IFormFile formFile, float maxLength, string volumePath);

        public Task<bool> ReplaceFileAsync(IFormFile formFile, string volumePath, string fileName, float maxLength);

        public Task<FileStream?> GetCardFaceFileAsync(string fileName);

        public Task<IEnumerable<FileStream>> GetCardFaceFilesAsync(List<string> fileNames);

        public Task<FileStream?> GetCardFaceElementImageFileAsync(string fileName);

        public Task<string?> UploadCardFaceFileAsync(IFormFile formFile);

        public Task<IEnumerable<string>> UploadCardFaceFilesAsync(List<IFormFile> formFiles);

        public Task<string?> UploadCardFaceElementImageFileAsync(IFormFile formFile);

        public Task<bool> ReplaceCardFaceFileAsync(IFormFile formFile, string fileName);

        public Task<bool> ReplaceCardFaceElementImageFileAsync(IFormFile formFile, string fileName);

        public Task DeleteFileAsync(string volumePath, string fileName);

        public Task DeleteCardFaceFileAsync(string fileName);

        public Task DeleteCardFaceElementImageFileAsync(string fileName);

        public Task<string> ReplaceFilePathAsync(string volumePath, string sourceFileName);

        public Task<IEnumerable<string>> ReplaceFilePathsAsync(string volumePath, string[] sourceFileNames);

        public Task<IEnumerable<string>> ReplaceCardFaceThumbnailImagesFilePathAsync(string[] srcFileNames);

        public Task<string> ReplaceCardFaceElementImageFilePathAsync(string srcFileName);

        public Task<string> ReplaceCardFaceThumbnailImageFilePathAsync(string srcFileName);
    }
}