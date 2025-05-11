namespace Services
{
    public interface ICrudDto<T>
    {
        public bool Exists(string id);
        public Task<IEnumerable<T>> GetAllDtoAsync();

        public Task<T?> GetDtoAsync(string id);
        public Task<T> CreateDtoAsync(T dto);
        public Task<bool> UpdateDtoAsync(string id, T dto);
        public Task<bool> DeleteDtoAsync(string id);

        public Task<T?> GetDtoNavAsync(string id);
        public Task<T> CreateDtoNavAsync(T dto);
        public Task<bool> UpdateDtoNavAsync(string id, T dto);
        public Task<bool> DeleteDtoNavAsync(string id);
    }
}