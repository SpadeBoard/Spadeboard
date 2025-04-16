namespace Services
{
    public interface ICrudDto<T>
    {
        public Task<T?> GetDtoAsync(int id);
        public Task CreateDtoAsync(T dto);
        public Task UpdateDtoAsync(T dto);
        public Task<bool> DeleteDtoAsync(T dto);
    }
}