using Models.Cards;

namespace Services
{
    public interface ICardService: ICrud<Card>, ICrudNav<Card>
    {
        // TODO: Refactor the card DTO functions
    }
}