using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPerOwnerDtoService : ICrudDto<CardPerOwnerDto>
    {
        public Task<CardPerOwnerDto?> GetDtoByCardIdAsync(string cardId);
    
        public Task<CardPerOwnerDto?> GetDtoByCardIdAndOwnerIdAsync(string cardId, string ownerId);

        public Task<IEnumerable<CardDto>> GetCardsDtoByOwnerIdAsync(string ownerId);

        public Task<bool> DeleteDtoByCardIdAndOwnerIdAsync(string cardId, string ownerId);
    }
}