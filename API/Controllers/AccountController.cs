using System;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace API.Controllers;

public class AccountController(DataContext dataContext, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDTO registerDTO)
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

        var userDto = await Login(new LoginDto
        {
            Username = registerDTO.Username,
            Password = registerDTO.Password
        });

        return userDto;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await dataContext.Users.FirstOrDefaultAsync(val => val.Username == loginDto.Username.ToLower());

        if (user == null)
        {
            return Unauthorized("Invalid username!");
        }

        using var hmac = new HMACSHA512(user.PasswordSalt);

        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != user.PasswordHash[i])
            {
                return Unauthorized("Invalid password!");
            }
        }

        return new UserDto
        {
            Username = user.Username,
            Token = tokenService.CreateToken(user)
        };
    }

    private async Task<bool> UsernameExists(string username)
    {
        return await dataContext.Users.AnyAsync(user => user.Username.ToLower() == username.ToLower());
    }
}
