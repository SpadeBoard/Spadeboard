namespace Services
{
    public interface ICrud<T>
    {
        public Task<IEnumerable<T>> GetAllAsync();
        public Task<T?> GetAsync(int id);
        public Task CreateAsync(T item);
        public Task<bool> UpdateAsync(int id, T item);
        public Task<bool> DeleteAsync(int id);
        
        public bool Exists(int id);

        public bool IsModified(T item);
    }
}