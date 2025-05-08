namespace Services
{
    public interface ICrudDto<T>
    {
        public Task<T?> GetDtoAsync(long id);
        public Task CreateDtoAsync(T dto);
        public Task<bool> UpdateDtoAsync(long id, T dto);
        public Task<bool> DeleteDtoAsync(long id);
    }
}