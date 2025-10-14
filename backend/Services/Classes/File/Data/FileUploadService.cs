using System.Text.Json;

namespace Services
{
    public class FileUploadService() : IFileUploadService
    {
        // TODO: Use switch statement to switch between file types and where to store them
        // TODO: Modify this to read from the environment instead, maybe pass in the volume path instead as a parameter
        private readonly string cardFaceFilePath = "/app/backend/card-face-thumbnail-images";
        private readonly string cardFaceElementImageFilePath = "/app/backend/card-face-elements-images";

        // NOTE: Allow an option to toggle on max file length, but also need to make sure the card creation process doesn't stop in case if the length is too big
        private readonly float maxFileSizeCardFace = 1000000; // TODO: Read from environment variable

        private readonly float maxFileSizeCardFaceElementImage = 1000000; // TODO: Read from environment variable

        // TODO: Replace with entire path? Because the fileName should include the volume path too
        public async Task<FileStream?> GetFileAsync(string fileName, string volumePath)
        {
            if (string.IsNullOrWhiteSpace(fileName) || volumePath == null)
            {
                return null;
            }

            var filePath = Path.Combine(volumePath, fileName);

            try
            {
                // Asynchronous file existence check
                if (!await Task.Run(() => File.Exists(filePath)))
                {
                    return null;
                }

                // Truly asynchronous file stream with proper async configuration
                return new FileStream(
                    filePath,
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.Read,
                    bufferSize: 4096,
                    useAsync: true
                );
            }
            catch
            {
                return null;
            }
        }

        public async Task<string?> UploadFileAsync(IFormFile formFile, float maxLength, string volumePath)
        {
            // TODO: To be modified, this should be specifically for images
            if (formFile.Length > 0 /*&& formFile.Length < maxLength*/ && volumePath != null)
            {
                // TODO: Replace -1 for the card face ID in the other function
                // string fileName = String.Format("{0}-{1}", -1, Guid.NewGuid().ToString());

                string fileName = Guid.NewGuid().ToString();

                // string? fileName = Path.GetRandomFileName() + Path.GetExtension(formFile.FileName); // TODO: Replace the file name
                string? filePath = Path.Combine(volumePath, fileName);

                Directory.CreateDirectory(volumePath); // Ensure directory exists

                using var stream = System.IO.File.Create(filePath);
                await formFile.CopyToAsync(stream);

                Console.WriteLine("Upload file async success");

                return fileName;
            }

            Console.WriteLine("Upload file async failed");

            return null;
        }

        public async Task<bool> ReplaceFileAsync(IFormFile formFile, string volumePath, string fileName, float maxLength)
        {
            if (formFile.Length <= 0 /*|| formFile.Length > maxLength*/ || string.IsNullOrEmpty(fileName))
                return false;

            string tempFilePath = Path.GetTempFileName();
            string destinationFilePath = Path.Combine(volumePath, fileName);
            string backupFilePath = Path.Combine(volumePath, fileName + ".bak");

            try
            {
                // NOTE: File.Replace and File.Move require both files to be on the same filesystem because they use atomic operations that rely on hard links, which are not possible across filesystems
                // Write uploaded file to temp file
                using (var tempStream = System.IO.File.Create(tempFilePath))
                {
                    await formFile.CopyToAsync(tempStream);
                }

                // Backup the original file if needed
                if (File.Exists(destinationFilePath))
                {
                    File.Copy(destinationFilePath, backupFilePath, overwrite: true);
                }

                // Overwrite the destination with the temp file
                File.Copy(tempFilePath, destinationFilePath, overwrite: true);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return false;
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }
        }

        public async Task<bool> ReplaceCardFaceFileAsync(IFormFile formFile, string fileName)
        {
            return await ReplaceFileAsync(formFile, cardFaceFilePath, fileName, maxFileSizeCardFace);
        }

        public async Task<bool> ReplaceCardFaceElementImageFileAsync(IFormFile formFile, string fileName)
        {
            return await ReplaceFileAsync(formFile, cardFaceElementImageFilePath, fileName, maxFileSizeCardFaceElementImage);
        }

        public async Task<FileStream?> GetCardFaceFileAsync(string fileName)
        {
            return await GetFileAsync(fileName, cardFaceFilePath);
        }

        public async Task<IEnumerable<FileStream>> GetCardFaceFilesAsync(List<string> fileNames)
        {
            List<FileStream> cardFaces = [];

            foreach (string fileName in fileNames)
            {
                FileStream? file = await GetFileAsync(fileName, cardFaceFilePath);
                if (file != null) cardFaces.Add(file);
            }

            return cardFaces;
        }

        public async Task<string?> UploadCardFaceFileAsync(IFormFile formFile)
        {
            return await UploadFileAsync(formFile, maxFileSizeCardFace, cardFaceFilePath);
        }

        public async Task<IEnumerable<string>> UploadCardFaceFilesAsync(List<IFormFile> formFiles)
        {
            Console.WriteLine("Upload card face files: ", JsonSerializer.Serialize(formFiles));

            List<string> fileNames = [];

            foreach (IFormFile formFile in formFiles)
            {
                string? fileName = await UploadFileAsync(formFile, maxFileSizeCardFace, cardFaceFilePath);

                if (fileName != null) fileNames.Add(fileName);
            }

            return fileNames;
        }

        public async Task<FileStream?> GetCardFaceElementImageFileAsync(string fileName)
        {
            return await GetFileAsync(fileName, cardFaceElementImageFilePath);
        }

        public async Task<string?> UploadCardFaceElementImageFileAsync(IFormFile formFile)
        {
            return await UploadFileAsync(formFile, maxFileSizeCardFaceElementImage, cardFaceElementImageFilePath);
        }

        public async Task DeleteFileAsync(string volumePath, string fileName)
        {
            string fullPath = Path.Combine(volumePath, fileName);
            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
            }
            else
            {
                // Optionally handle the case where the file doesn't exist
                // For example, throw an exception or just return
            }
        }

        public async Task DeleteCardFaceFileAsync(string fileName)
        {
            await DeleteFileAsync(cardFaceFilePath, fileName);
        }

        public async Task DeleteCardFaceElementImageFileAsync(string fileName)
        {
            await DeleteFileAsync(cardFaceElementImageFilePath, fileName);
        }

        public async Task<IEnumerable<string>> ReplaceFilePathsAsync(string volumePath, string[] sourceFileNames)
        {
            List<string> filePaths = [];

            foreach (string sourceFileName in sourceFileNames)
            {
                filePaths.Add(await ReplaceFilePathAsync(volumePath, sourceFileName));
            }

            return filePaths;
        }

        public async Task<string> ReplaceFilePathAsync(string volumePath, string sourceFileName)
        {
            string sourceFilePath = Path.Combine(volumePath, sourceFileName);

            if (string.IsNullOrWhiteSpace(sourceFileName))
                throw new ArgumentException("Source file name cannot be null or empty.", nameof(sourceFileName));
            if (!File.Exists(sourceFilePath))
                throw new FileNotFoundException("Source file does not exist.", sourceFileName);

            string destinationFileName = Guid.NewGuid().ToString();
            string destinationFilePath = Path.Combine(volumePath, destinationFileName);

            // Asynchronously copy the file
            using (FileStream sourceStream = File.Open(sourceFilePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            using (FileStream destinationStream = File.Create(destinationFilePath))
            {
                await sourceStream.CopyToAsync(destinationStream);
            }

            return destinationFileName;
        }

        public async Task<string> ReplaceCardFaceElementImageFilePathAsync(string srcFileName)
        {
            return await ReplaceFilePathAsync(cardFaceElementImageFilePath, srcFileName);
        }

        public async Task<string> ReplaceCardFaceThumbnailImageFilePathAsync(string srcFileName)
        {
            return await ReplaceFilePathAsync(cardFaceFilePath, srcFileName);
        }

        public async Task<IEnumerable<string>> ReplaceCardFaceThumbnailImagesFilePathAsync(string[] srcFileNames)
        {
            return await ReplaceFilePathsAsync(cardFaceFilePath, srcFileNames);
        }

        // TODO: Delete files at a certain point if there's no user reference to it
    }
}