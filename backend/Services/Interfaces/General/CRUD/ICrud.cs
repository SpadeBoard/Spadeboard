namespace Services
{
    public interface ICrud<T>
    {
        public Task<IEnumerable<T>> GetAllAsync();
        public Task<T?> GetAsync(long id);
        public Task CreateAsync(T item);
        public Task<bool> UpdateAsync(long id, T item);
        public Task<bool> DeleteAsync(long id);
        
        public bool Exists(long id);

        public bool IsModified(T item);
    }
}