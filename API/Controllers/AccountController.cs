using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace API.Controllers;

public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService, IMapper mapper) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDTO registerDTO)
    {
        if (await UsernameExists(registerDTO.Username))
        {
            return BadRequest("Username is taken!");
        }

        var user = mapper.Map<AppUser>(registerDTO);
        user.UserName = registerDTO.Username.ToLower();

        var result = await userManager.CreateAsync(user, registerDTO.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return new UserDto
        {
            Username = user.UserName,
            Token = await tokenService.CreateToken(user),
            KnownAs = user.KnownAs,
            Gender = user.Gender
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await userManager.Users
            .Include(user => user.Photos)
            .FirstOrDefaultAsync(val => val.NormalizedUserName == loginDto.Username.ToUpper());

        if (user == null || user.UserName == null)
        {
            return Unauthorized("Invalid username!");
        }

        var result = await userManager.CheckPasswordAsync(user, loginDto.Password);

        if (!result)
        {
            return Unauthorized();
        }

        return new UserDto
        {
            Username = user.UserName,
            Token = await tokenService.CreateToken(user),
            MainPhotoUrl = user.Photos.FirstOrDefault(photo => photo.IsMain)?.Url,
            KnownAs = user.KnownAs,
            Gender = user.Gender
        };
    }

    private async Task<bool> UsernameExists(string username)
    {
        return await userManager.Users.AnyAsync(user => user.NormalizedUserName == username.ToUpper());
    }
}
