using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;

namespace Services
{
    public class FileUploadService() : IFileUploadService
    {
        // TODO: Use switch statement to switch between file types and where to store them
        // TODO: Modify this to read from the environment instead, maybe pass in the volume path instead as a parameter
        private readonly string cardFaceFilePath = "/app/backend/card-face-thumbnail-images";
        private readonly string cardFaceElementImageFilePath = "/app/backend/card-face-elements-images";
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

            /*
                System.IO.IOException: Cross-device link
                at Interop.ThrowExceptionForIoErrno(ErrorInfo errorInfo, String path, Boolean isDirError)
                at Interop.CheckIo(Int64 result, String path, Boolean isDirError)
                at System.IO.FileSystem.ReplaceFile(String sourceFullPath, String destFullPath, String destBackupFullPath, Boolean ignoreMetadataErrors)
                at Services.FileUploadService.ReplaceFileAsync(IFormFile formFile, String volumePath, String fileName, Single maxLength) in /app/backend/Services/Classes/File/FileUploadService.cs:line 110
            */

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

        public async Task<string?> UploadCardFaceFileAsync(IFormFile formFile)
        {
            // TODO: To be modified, this should be specifically for images
            return await UploadFileAsync(formFile, maxFileSizeCardFace, cardFaceFilePath);
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

        // TODO: figure out how to fix this
        /*public void ConvertBlobToFile(byte[] blob, string filePath) {
            try 
            {
                filePath = Path.Combine(cardFaceFilePath, filePath);

                using FileStream fs = new(filePath, FileMode.Create);
                using BinaryWriter bw = new(fs);
                bw.Write(blob);
                // https://learn.microsoft.com/en-us/dotnet/api/system.io.filestream?view=net-9.0
                // https://learn.microsoft.com/en-us/dotnet/api/system.io.binarywriter?view=net-9.0
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("An error occurred while writing the file: " + ex.Message);
            }
        }*/

        // TODO: Delete files at a certain point if there's no user reference to it

        // TODO: Replace file path, use it with creating a new CardEditorCardDto from an existing one, replace the file path
    }
}