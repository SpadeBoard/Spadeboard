using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface IFileAuthenticationPerExportedCardService: ICrud<FileAuthenticationPerExportedCard>
    {
        public Task<bool> IsValidImport(CardEditorCardDto cardEditorCardDto);
    }
}