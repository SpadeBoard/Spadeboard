using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Services;
using Models.Cards;

namespace Models.Bridge
{
    // TODO: Need to know when to actually delete these
    // Probably only when the user's account is deleted
    // And check after several years, or something like that
    [Table("FileAuthenticationPerExportedCard")]
    public class FileAuthenticationPerExportedCard: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long FileAuthenticationPerExportedCardId {get;set;}

        [NotMapped]
        public long Id { get => FileAuthenticationPerExportedCardId; set => FileAuthenticationPerExportedCardId = value; }

        public long CardId {get; set;}

        [NotMapped]
        public virtual CardEditorCardDto? CardEditorCardDto {get;set;}

        [MaxLength(256)]
        public string FileHash {get;set;}

        public string DigitalSignature {get; set;}
    }

     public class FileAuthenticationPerExportedCardDto
    {        
        public string FileAuthenticationPerExportedCardId {get;set;}

        public string CardId {get; set;}

        public virtual CardEditorCardDto? CardEditorCardDto {get;set;}

        public string FileHash {get;set;}

        public string DigitalSignature {get; set;}
    }
}