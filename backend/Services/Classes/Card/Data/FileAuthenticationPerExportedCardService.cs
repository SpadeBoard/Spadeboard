using Models.Bridge;
using Data;
using System.Text.Json;
using Utils;

// https://stackoverflow.com/questions/59753218/how-to-use-dbcontext-in-separate-class-library-net-core
// https://www.postgresql.org/docs/current/ddl-schemas.html#:~:text=Unlike%20databases%2C%20schemas%20are%20not,without%20interfering%20with%20each%20other.

// Main schema: bridge tables containing item, dnd position, game room id as well as bridge tables containing item ID and user ID


namespace Services
{
    public class FileAuthenticationPerExportedCardService(ApplicationDbContext context) : IFileAuthenticationPerExportedCardService
    {
        private readonly CrudService<FileAuthenticationPerExportedCard> _crudService = new(context, fileAuthenticationPerExportedCard => fileAuthenticationPerExportedCard.FileAuthenticationPerExportedCardId);

        public async Task<FileAuthenticationPerExportedCard> CreateAsync(FileAuthenticationPerExportedCard item)
        {
            if (item.CardEditorCardDto == null) {
                throw new ArgumentNullException("Lack a CardEditorCardDto to authenticate file");
            }

            item.FileHash = FileAuthentication.ComputeSHA256FromString(JsonSerializer.Serialize(item.CardEditorCardDto));

            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(FileAuthenticationPerExportedCard item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<FileAuthenticationPerExportedCard>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<FileAuthenticationPerExportedCard?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, FileAuthenticationPerExportedCard item)
        {
            return await _crudService.UpdateAsync(id, item);
        }
    }
}