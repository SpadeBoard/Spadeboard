using Models.Cards;

namespace Services
{
    public interface ICardFaceDtoService : ICrudDto<CardFaceDto>, ICrudNavDto<CardFaceDto>
    {
    }
}