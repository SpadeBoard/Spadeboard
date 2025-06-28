using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface IFileAuthenticationPerExportedCardDtoService: ICrudDto<FileAuthenticationPerExportedCardDto>
    {
        public Task<bool> IsValidImportDto(CardEditorCardDto cardEditorCardDto);
    }
}