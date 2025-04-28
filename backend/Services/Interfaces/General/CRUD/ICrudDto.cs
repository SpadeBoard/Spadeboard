namespace Services
{
    public interface ICrudDto<T>
    {
        public Task<T?> GetDtoAsync(int id);
        public Task CreateDtoAsync(T dto);
        public Task<bool> UpdateDtoAsync(int id, T dto);
        public Task<bool> DeleteDtoAsync(int id);
    }
}