using System;
using API.DTOs;
using API.Entities;
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

    public async Task<IEnumerable<MemberDto>> GetMembersAsync()
    {
        return await dataContext.Users
        .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
        .ToListAsync();
    }

    public async Task<AppUser?> GetUserByIdAsync(int id)
    {
        return await dataContext.Users.FindAsync(id);
    }

    public async Task<MemberDto?> GetMemberByUsernameAsync(string username)
    {
        return await dataContext.Users
        .Where(user => user.Username == username)
        .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
        .SingleOrDefaultAsync();
    }

    public async Task<AppUser?> GetUserByUsernameAsync(string username)
    {
        return await dataContext.Users
        .Include(user => user.Photos)
        .SingleOrDefaultAsync(user => user.Username == username);
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
