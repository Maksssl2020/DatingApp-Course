using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace API.Controllers;

public class AccountController(DataContext dataContext, ITokenService tokenService, IMapper mapper) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDTO registerDTO)
    {
        if (await UsernameExists(registerDTO.Username))
        {
            return BadRequest("Username is taken!");
        }

        using var hmac = new HMACSHA512();

        var user = mapper.Map<AppUser>(registerDTO);
        user.Username = registerDTO.Username.ToLower();
        user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password));
        user.PasswordSalt = hmac.Key;


        dataContext.Add(user);
        await dataContext.SaveChangesAsync();

        return new UserDto
        {
            Username = user.Username,
            Token = tokenService.CreateToken(user),
            KnownAs = user.KnownAs,
            Gender = user.Gender
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await dataContext.Users
            .Include(user => user.Photos)
            .FirstOrDefaultAsync(val => val.Username == loginDto.Username.ToLower());

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
            Token = tokenService.CreateToken(user),
            MainPhotoUrl = user.Photos.FirstOrDefault(photo => photo.IsMain)?.Url,
            KnownAs = user.KnownAs,
            Gender = user.Gender
        };
    }

    private async Task<bool> UsernameExists(string username)
    {
        return await dataContext.Users.AnyAsync(user => user.Username.ToLower() == username.ToLower());
    }
}
