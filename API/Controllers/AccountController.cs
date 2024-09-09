using System;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace API.Controllers;

public class AccountController(DataContext dataContext) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<AppUser>> Register(RegisterDTO registerDTO)
    {

        if (await UsernameExists(registerDTO.Username))
        {
            return BadRequest("Username is taken!");
        }

        using var hmac = new HMACSHA512();
        var user = new AppUser
        {
            Username = registerDTO.Username.ToLower(),
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password)),
            PasswordSalt = hmac.Key
        };

        dataContext.Users.Add(user);
        await dataContext.SaveChangesAsync();

        return user;
    }

    private async Task<bool> UsernameExists(string username)
    {
        return await dataContext.Users.AnyAsync(user => user.Username.ToLower() == username.ToLower());
    }
}
