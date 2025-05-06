namespace Services
{
    public interface ICrudNav<T>
    {
        public Task<IEnumerable<T>> GetAllNavAsync();
        public Task<T?> GetNavAsync(int id);
        public Task CreateNavAsync(T nav);
        public Task<bool> UpdateNavAsync(T nav);

        // https://stackoverflow.com/questions/61283974/how-to-check-if-a-delete-operation-succeeds-in-asp-net-mvc-using-entity-framewor
        public Task<bool> DeleteNavAsync(int id);
    }
}