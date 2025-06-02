using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Services;

namespace Models.Tags
{
    // CHECKME: We want to normalise the tags?
    [Table("Tags")]
    public class Tag: ICrudId
    {
         [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long TagId { get; set; }

         [NotMapped]
        public long Id { get => TagId; set => TagId = value; }

        public string TagName {get; set;}
    }

    public class TagDto
    {
        public string TagId { get; set; }

        public string TagName {get; set;}
    }
}