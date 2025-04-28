using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Models.DndItems;


namespace Services
{
    public class DndItemDtoService(ApplicationDbContext context,  ICardFaceService cardFaceService, IDndItemService dndItemService, IDndPositionService dndPositionService, IStyleService styleService) : IDndItemDtoService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICardFaceService _cardFaceService = cardFaceService;
        private readonly IDndItemService _dndItemService = dndItemService;
        private readonly IDndPositionService _dndPositionService = dndPositionService;
        private readonly IStyleService _styleService = styleService;

        public Task CreateAsync(DndItemDto item)
        {
            throw new NotImplementedException();
        }

        public Task CreateNavAsync(DndItemDto nav)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteNavAsync(DndItemDto nav)
        {
            throw new NotImplementedException();
        }

        public bool Exists(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<DndItemDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<DndItemDto>> GetAllNavAsync()
        {
            throw new NotImplementedException();
        }

        public Task<DndItemDto?> GetAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<DndItemDto?> GetByDndItemIdAndDndPositionIdAsync(int dndItemId, int dndPositionId)
        {
            var dndItem = await _dndItemService.GetAsync(dndItemId);
        
            var dndPosition = await _dndPositionService.GetAsync(dndPositionId);

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

        public Task<DndItemDto?> GetNavAsync(int id)
        {
            throw new NotImplementedException();
        }

        public bool IsModified(DndItemDto item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(int id, DndItemDto item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateNavAsync(DndItemDto nav)
        {
            throw new NotImplementedException();
        }
    }
}