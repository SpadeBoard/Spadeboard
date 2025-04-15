using System;
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
        private readonly string volumePath = "/app/backend/card-face-thumbnail-images";
        private readonly float maxFileSizeCardFace = 30000; // TODO: Read from environment variable

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
            if (formFile.Length > 0 && formFile.Length < maxLength && volumePath != null)
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


        public async Task<FileStream?> GetCardFaceFileAsync(string fileName)
        {
            return await GetFileAsync(fileName, volumePath);
        }

        public async Task<string?> UploadCardFaceFileAsync(IFormFile formFile)
        {
            // TODO: To be modified, this should be specifically for images
            return await UploadFileAsync(formFile, maxFileSizeCardFace, volumePath);
        }

        // TODO: figure out how to fix this
        public void ConvertBlobToFile(byte[] blob, string filePath) {
            try 
            {
                filePath = Path.Combine(volumePath, filePath);

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
        }

        // TODO: Delete files at a certain point if there's no user reference to it
    }
}