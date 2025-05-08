using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using System.Net.Sockets;
using Newtonsoft.Json;
using Models.Bridge;

namespace Services
{
    public class CardFacePerCardService(ApplicationDbContext context, ICardService cardService, ICardFaceService cardFaceService) : ICardFacePerCardService
    {
        private readonly ApplicationDbContext _context = context;

        private readonly ICardService _cardService = cardService;

        private readonly ICardFaceService _cardFaceService = cardFaceService;

        public async Task CreateAsync(CardFacePerCard item)
        {
            _context.CardFacePerCard.Add(item);
            await _context.SaveChangesAsync();
        }

        public Task CreateNavAsync(CardFacePerCard nav)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(long id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteNavAsync(long nav)
        {
            throw new NotImplementedException();
        }

        public bool Exists(long id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<CardFacePerCard>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<CardFacePerCard>> GetAllNavAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<CardFacePerCard>> GetAllNavByCardId(long cardId)
        {
            return await _context.CardFacePerCard
                .Where(c => c.CardId == cardId)
                .Include(c => c.Card)
                .Include(c => c.CardFace)
                .ToListAsync();
        }

        public async Task<IEnumerable<CardFacePerCard>> GetAllByCardId(long cardId)
        {
            return await _context.CardFacePerCard
                .Where(c => c.CardId == cardId)
                .ToListAsync();
        }

        public Task<CardFacePerCard?> GetAsync(long id)
        {
            throw new NotImplementedException();
        }

        public Task<CardFacePerCard?> GetNavAsync(long id)
        {
            throw new NotImplementedException();
        }

        public bool IsModified(CardFacePerCard item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(long id, CardFacePerCard item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateNavAsync(CardFacePerCard nav)
        {
            throw new NotImplementedException();
        }

        // TODO: Create card faces per card from CardEditorCardFaceDto and cardId
        public async Task CreateAsyncFromCardEditorCardDto(CardEditorCardDto cardEditorCardDto)
        {
            long cardId = cardEditorCardDto.Card.CardId;

            // FIXME: How is this null
            if (cardEditorCardDto.CardEditorCardFacesDto == null)
            {
                throw new NotImplementedException();
            }

            foreach (var cardFaceDto in cardEditorCardDto.CardEditorCardFacesDto)
            {
                CardFacePerCard cfc = new(){
                    CardId = cardId,
                    CardFaceId = cardFaceDto.CardFace.CardFaceId
                };

                await CreateAsync(cfc);
            }
        }
    }
}
