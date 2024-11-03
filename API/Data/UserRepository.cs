using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UserRepository(DataContext dataContext, IMapper mapper) : IUserRepository
{
    public async Task<MemberDto?> GetMemberByIdAsync(int id)
    {
        return await dataContext.Users
        .Where(user => user.Id == id)
        .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
        .SingleOrDefaultAsync();
    }

    public async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams)
    {
        var query = dataContext.Users.AsQueryable();

        query = query.Where(user => user.UserName != userParams.CurrentUsername);

        if (userParams.Gender != null)
        {
            query = query.Where(user => user.Gender == userParams.Gender);
        }

        var minDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-userParams.MaxAge - 1));
        var maxDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-userParams.MinAge));

        query = query.Where(user => user.DateOfBirth >= minDob && user.DateOfBirth <= maxDob);

        query = userParams.OrderBy switch
        {
            "created" => query.OrderByDescending(user => user.Created),
            _ => query.OrderByDescending(user => user.LastActive)
        };

        return await PagedList<MemberDto>.CreateAsync(query.ProjectTo<MemberDto>(mapper.ConfigurationProvider), userParams.pageNumber, userParams.PageSize);
    }

    public async Task<AppUser?> GetUserByIdAsync(int id)
    {
        return await dataContext.Users.FindAsync(id);
    }

    public async Task<MemberDto?> GetMemberByUsernameAsync(string username)
    {
        return await dataContext.Users
        .Where(user => user.NormalizedUserName == username.ToUpper())
        .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
        .SingleOrDefaultAsync();
    }

    public async Task<AppUser?> GetUserByUsernameAsync(string username)
    {
        return await dataContext.Users
        .Include(user => user.Photos)
        .SingleOrDefaultAsync(user => user.UserName == username);
    }

    public async Task<IEnumerable<AppUser>> GetUsersAsync()
    {
        return await dataContext.Users
        .Include(user => user.Photos)
        .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await dataContext.SaveChangesAsync() > 0;
    }

    public void Update(AppUser user)
    {
        dataContext.Entry(user).State = EntityState.Modified;
    }
}
