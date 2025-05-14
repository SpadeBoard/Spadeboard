using AutoMapper;
using Models.Cards;
using Models.DndItems;
using Models.Styles;
using Models.Bridge;
using Models.GameRooms;

// https://stackoverflow.com/questions/40275195/how-to-set-up-automapper-in-asp-net-core
// https://docs.automapper.org/en/stable/Configuration.html#naming-conventions
// CHECKME: See if there's a way to make these calls to a single function, rather than a bunch of similar code sections
namespace Mapper
{
    public class CardGameCoreMappingProfile : Profile
    {
        public CardGameCoreMappingProfile()
        {
            // Long -> String
            CreateMap<Card, CardDto>();

            // String -> Long
            CreateMap<CardDto, Card>()
                .ForMember(dest => dest.CardId, 
                           opt => opt.MapFrom(src => long.Parse(src.CardId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());;
            
            CreateMap<CardPositionPerRoomDto, CardPositionPerRoom>()
                .ForMember(dest => dest.CardPositionPerRoomId, 
                           opt => opt.MapFrom(src => long.Parse(src.CardPositionPerRoomId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());
        
            CreateMap<CardPositionPerRoom, CardPositionPerRoomDto>();

              // Long -> String
            CreateMap<CardFace, CardFaceDto>();

            // String -> Long
            CreateMap<CardFaceDto, CardFace>()
                .ForMember(dest => dest.CardFaceId, 
                           opt => opt.MapFrom(src => long.Parse(src.CardFaceId)))
               .ForMember(dest => dest.StyleId, 
                            opt => opt.MapFrom(src => string.IsNullOrEmpty(src.StyleId) ? (long?)null : long.Parse(src.StyleId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // Long -> String
            CreateMap<CardFacePerCard, CardFacePerCardDto>();

            // String -> Long
            CreateMap<CardFacePerCardDto, CardFacePerCard>()
                .ForMember(dest => dest.CardFacePerCardId,
                           opt => opt.MapFrom(src => long.Parse(src.CardFacePerCardId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // Long -> String
            CreateMap<CardFaceElement, CardFaceElementDto>();

            // String -> Long
            CreateMap<CardFaceElementDto, CardFaceElement>()
                .ForMember(dest => dest.CardFaceElementId, 
                           opt => opt.MapFrom(src => long.Parse(src.CardFaceElementId)))
                .ForMember(dest => dest.StyleId, 
                    opt => opt.MapFrom(src => string.IsNullOrEmpty(src.StyleId) ? (long?)null : long.Parse(src.StyleId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // Long -> String
            CreateMap<CardFaceElementPerCardFace, CardFaceElementPerCardFaceDto>();

            CreateMap<CardFaceElementPerCardFaceDto, CardFaceElementPerCardFace>()
                .ForMember(dest => dest.CardFaceElementPerCardFaceId,
                        opt => opt.MapFrom(src => long.Parse(src.CardFaceElementPerCardFaceId)))
                .ForMember(dest => dest.CardFaceElementId,
                        opt => opt.MapFrom(src => long.Parse(src.CardFaceElementId)))
                .ForMember(dest => dest.DndItemId,
                        opt => opt.MapFrom(src => long.Parse(src.DndItemId)))
                .ForMember(dest => dest.DndPositionId,
                        opt => opt.MapFrom(src => long.Parse(src.DndPositionId)))
                .ForMember(dest => dest.CardFaceId,
                        opt => opt.MapFrom(src => long.Parse(src.CardFaceId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // Long -> String
            CreateMap<DndItem, DndItemDto>();

            // String -> Long
            CreateMap<DndItemDto, DndItem>()
                .ForMember(dest => dest.DndItemId, 
                           opt => opt.MapFrom(src => long.Parse(src.DndItemId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());;

             // Long -> String
            CreateMap<DndPosition, DndPositionDto>();

            // String -> Long
            CreateMap<DndPositionDto, DndPosition>()
                .ForMember(dest => dest.DndPositionId, 
                           opt => opt.MapFrom(src => long.Parse(src.DndPositionId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());;
        
             CreateMap<DndDragBoundary, DndDragBoundaryDto>();

            // String -> Long
            CreateMap<DndDragBoundaryDto, DndDragBoundary>()
                .ForMember(dest => dest.DndDragBoundaryId, 
                           opt => opt.MapFrom(src => long.Parse(src.DndDragBoundaryId)));

            // Long -> String
            CreateMap<Style, StyleDto>();

            // String -> Long
            CreateMap<StyleDto, Style>()
                .ForMember(dest => dest.StyleId, 
                           opt => opt.MapFrom(src => long.Parse(src.StyleId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());

             // Long -> String
            CreateMap<CardPerOwner, CardPerOwnerDto>();

            // String -> Long
            CreateMap<CardPerOwnerDto,CardPerOwner>()
                .ForMember(dest => dest.CardPerOwnerId, 
                           opt => opt.MapFrom(src => long.Parse(src.CardPerOwnerId)))
                .ForMember(dest => dest.CardId, 
                           opt => opt.MapFrom(src => long.Parse(src.CardId)))
                .ForMember(dest => dest.Card, opt => opt.Ignore())
                .ForMember(dest => dest.Owner, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore());
        
            CreateMap<GameRoom, GameRoomDto>();

            // String -> Long
            CreateMap<GameRoomDto, GameRoom>()
                .ForMember(dest => dest.GameRoomId, 
                           opt => opt.MapFrom(src => long.Parse(src.GameRoomId)))
                .ForMember(dest => dest.Id, opt => opt.Ignore());
        }
    }
}
