using System.Text;
using System.Security.Cryptography;
using System.IO.Compression;

namespace Utils {
    public static class ZipArchiveFunctionality 
    {
        public async static Task<MemoryStream> Zip(IEnumerable<FileStream> files) 
        {
            try
            {
                // NOTE: Using would automatically dispose it
                MemoryStream ms = new();
                using (ZipArchive  zip = new(ms, ZipArchiveMode.Create, leaveOpen: true))
                {
                    foreach (FileStream file in files)
                    {
                        if (file.CanSeek) file.Position = 0;
                        ZipArchiveEntry  entry = zip.CreateEntry(file.Name);

                        using Stream? entryStream = entry.Open();
                        await file.CopyToAsync(entryStream);
                    }
                }

                ms.Position = 0; // Reset to start of stream

                return ms;
            }
            catch (Exception ex)
            {
                throw new  Exception($"Error while creating ZIP: {ex.Message}");
            }
        }
    }
    
    public static class DtoIdConversion 
    {
        public static long DtoStringToLong(string id) {
            return long.Parse(id);
        }
    }

    public static class FileAuthentication
    {
        public static string ComputeSHA256FromString(string content)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(content);
            return ComputeSHA256FromBytes(bytes);
        }

        public static string ComputeSHA256FromBytes(byte[] data)
        {
            byte[] hash = SHA256.HashData(data);
            return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
        }

        // TODO: The data should be the hash that's being passed in
        public static string CreateDigitalSignature(string key, string data)
        {
            using RSACryptoServiceProvider? rsa = new RSACryptoServiceProvider();
            {
                rsa.PersistKeyInCsp = false;
                rsa.FromXmlString(key);
                byte[] dataBytes = Encoding.UTF8.GetBytes(data);
                byte[] signatureBytes = rsa.SignData(dataBytes, CryptoConfig.MapNameToOID("SHA256"));
                return Convert.ToBase64String(signatureBytes);
            }
        }
    }
}