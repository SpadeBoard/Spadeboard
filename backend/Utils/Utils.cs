using System.Text;
using System.Security.Cryptography;

namespace Utils {
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