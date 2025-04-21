using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.DndItems;
using Models.Cards;
using Models.Bridge;

namespace Services
{
    public class DndItemService(ApplicationDbContext context) : IDndItemService
    {
        private readonly ApplicationDbContext _context = context;

        // TODO: Add optional parameter to get the boundary
        public async Task<DndItemDto?> GetDndItemDtoByDndItemIdAndDndPositionIdAsync(int dndItemId, int dndPositionId)
        {
            var dndItem = await _context.DndItem.FirstOrDefaultAsync(item => item.DndItemId == dndItemId);
        
            var dndPosition = await _context.DndPosition.FirstOrDefaultAsync(pos => pos.DndPositionId == dndPositionId);

            if (dndItem == null || dndPosition == null)
            {
                return null;
            }

            DndItemDto dndItemDto = new(){
                DndItem = dndItem,
                DndPosition = dndPosition
            };

            return dndItemDto;
        }

        // TODO: Rename all these types of functions to be consistent
        public async Task CreateDndItemNavAsync(DndItem dndItem)
        {
            // FIXME: Is this null then?
            /*if (dndItem.Style != null)
            {
                // ASSUMPTION: No need to set ID to 0 because it's already set to 0
                await _context.Style.AddAsync(dndItem.Style);
            }*/

            // FIXED: Temporary to bypass the ID set in frontend issue
            dndItem.DndItemId = 0;
            await _context.DndItem.AddAsync(dndItem);
        }

        public bool Exists(int id)
        {
            return _context.DndItem.Any(d => d.DndItemId == id);
        }

        // TODO: Figure out how to pass in DndPosition separately
        // CHECKME: Does the added items auto update the arguments
        /*
        24.98 /app/backend/Services/DndItemService.cs(43,60): error CS1061: 'CardFaceElementDto' does not contain a definition for 'DndItemDto' and no accessible extension method 'DndItemDto' accepting a first argument of type 'CardFaceElementDto' could be found (are you missing a using directive or an assembly reference?) [/app/backend/backend.csproj]
24.98 /app/backend/Services/DndItemService.cs(45,61): error CS1061: 'CardFaceElementDto' does not contain a definition for 'DndItemDto' and no accessible extension method 'DndItemDto' accepting a first argument of type 'CardFaceElementDto' could be found (are you missing a using directive or an assembly reference?) [/app/backend/backend.csproj]
24.98 /app/backend/Services/DndItemService.cs(49,46): error CS1061: 'CardFaceElementDto' does not contain a definition for 'DndItemDto' and no accessible extension method 'DndItemDto' accepting a first argument of type 'CardFaceElementDto' could be found (are you missing a using directive or an assembly reference?) [/app/backend/backend.csproj]
24.98 /app/backend/Services/DndItemService.cs(52,50): error CS1061: 'CardFaceElementDto' does not contain a definition for 'DndItemDto' and no accessible extension method 'DndItemDto' accepting a first argument of type 'CardFaceElementDto' could be found (are you missing a using directive or an assembly reference?) [/app/backend/backend.csproj]

        */

        /*
        FIXME: Should work though?
        2025-04-06 12:10:18           MessageText: insert or update on table "DndItems" violates foreign key constraint "FK_DndItems_Styles_StyleId"
2025-04-06 12:10:18           Detail: Key (StyleId)=(0) is not present in table "Styles".
        */

        // TODO: Move the CardFaceElement functions to CardFaceElement controller
        // ASSUMPTION: Use the CardFaceElement service in order to set it but then also grab its value, or just pass it in
        public async Task CreateCardFaceElementPerCardFaceAsync(CardFaceElementDto cardFaceElementDto)
        {
            // TODO: Use the CardFaceElement service in order to set it but then also grab its value, or just pass it in
            await CreateDndItemNavAsync(cardFaceElementDto.DndItemDto.DndItem);

            await CreateDndPositionAsync(cardFaceElementDto.DndItemDto.DndPosition);

            if (cardFaceElementDto.CardFaceElement.CardFace == null) 
            {
                throw new Exception();
            }

            CardFaceElementPerCardFace cardFaceElementDndAttributesPerCardFace = new()
            {
                DndItem = cardFaceElementDto.DndItemDto.DndItem,
                CardFaceElement = cardFaceElementDto.CardFaceElement,
                CardFace = cardFaceElementDto.CardFaceElement.CardFace, // CHECKME: Make sure this ain't null
                DndPosition = cardFaceElementDto.DndItemDto.DndPosition
            };

            await _context.CardFaceElementPerCardFace.AddAsync(cardFaceElementDndAttributesPerCardFace);
        }

        public async Task CreateDndPositionAsync(DndPosition dndPosition)
        {
            dndPosition.DndPositionId = 0;
            await _context.DndPosition.AddAsync(dndPosition);
        }

        public async Task<CardFaceElementPerCardFace?> GetCardFaceElementPerCardFaceByCardFaceIdAsync(int cardFaceElementId, int cardFaceId)
        {
            CardFaceElementPerCardFace? cardFaceElementDndAttributesPerCardFace = await _context.CardFaceElementPerCardFace.FirstOrDefaultAsync(attribute => attribute.CardFaceElement.CardFaceElementId == cardFaceElementId && attribute.CardFace.CardFaceId == cardFaceId);
            
            // TODO: Grab the card fa

            return cardFaceElementDndAttributesPerCardFace;
        }

        public Task<IEnumerable<DndItem>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<DndItem?> GetAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task CreateAsync(DndItem item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(int id, DndItem item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public bool IsModified(DndItem item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }
    }
}