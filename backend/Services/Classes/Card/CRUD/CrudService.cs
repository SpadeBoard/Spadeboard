using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NuGet.DependencyResolver;
using Data;
using Algorithms;
using System.Linq.Expressions;

namespace Services
{
    public class CrudService<T> : ICrud<T> where T : class, ICrudId
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<T> _dbSet;
        private readonly Expression<Func<T, long>> _keySelector;

        public CrudService(ApplicationDbContext context, Expression<Func<T, long>> keySelector)
        {
            _context = context;
            _dbSet = context.Set<T>();
            _keySelector = keySelector;
        }

        public async Task<T> CreateAsync(T item)
        {
            item.Id = Snowflake.NewId(); // or 0 if you want auto-increment
            await _dbSet.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var entity = await GetAsync(id);
            if (entity == null)
                return false;

            _dbSet.Remove(entity);
            return await _context.SaveChangesAsync() > 0;
        }

        public bool Exists(long id)
        {
            ParameterExpression parameter = Expression.Parameter(typeof(T), "e");
            BinaryExpression body = Expression.Equal(
                Expression.Invoke(_keySelector, parameter),
                Expression.Constant(id)
            );
            var lambda = Expression.Lambda<Func<T, bool>>(body, parameter);
            return _dbSet.Any(lambda);
        }

        public bool IsModified(T item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<T?> GetAsync(long id)
        {
            ParameterExpression parameter = Expression.Parameter(typeof(T), "e");
            BinaryExpression body = Expression.Equal(
                Expression.Invoke(_keySelector, parameter),
                Expression.Constant(id)
            );
            var lambda = Expression.Lambda<Func<T, bool>>(body, parameter);

            return await _dbSet.FirstOrDefaultAsync(lambda);
        }

        public async Task<bool> UpdateAsync(long id, T item)
        {
            if (item.Id != id)
                return false;

            _context.Entry(item).State = EntityState.Modified;
            try
            {
                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(id))
                    return false;
                throw;
            }
        }
    }
}