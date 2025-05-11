using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPositionPerRoomDtoService : ICrudDto<CardPositionPerRoomDto>
    {
        public Task<bool> UpdateAllDtoNavAsync(CardPositionPerRoomDto[] cardPositionPerRoomDtos);

        public Task<IEnumerable<CardPositionPerRoomDto>> GetAllDtoNavByRoomIdAsync(string gameRoomId);
    }
}