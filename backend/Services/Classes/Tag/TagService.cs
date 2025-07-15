using Data;
using Microsoft.EntityFrameworkCore;
using Models.Tags;

namespace Services
{
    public class TagService(ApplicationDbContext context) : ITagService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly CrudService<Tag> _crudService = new(context, tag => tag.TagId);

        public async Task<Tag> CreateAsync(Tag item)
        {
            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(Tag item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<Tag>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<Tag?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, Tag item)
        {
            return await _crudService.UpdateAsync(id, item);
        }

        public async Task<IEnumerable<String>> GetTagNamesAsync()
        {
            return await _context.Tag.Select(t => t.TagName).ToListAsync();
        }

        public async Task<Tag?> GetTagByTagNameAsync(string tagName)
        {
            return await _context.Tag.FirstOrDefaultAsync(t => t.TagName == tagName);
        }
    }
}