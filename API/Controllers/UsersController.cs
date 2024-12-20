using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService photoService) : BaseApiController
{

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
    {
        userParams.CurrentUsername = User.GetUsername();
        var users = await userRepository.GetMembersAsync(userParams);

        Response.AddPaginationHeader(users);

        return Ok(users);
    }

    [HttpGet("get-by-id/{id}")]
    public async Task<ActionResult<MemberDto>> GetUserById(int id)
    {
        var user = await userRepository.GetMemberByIdAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    [HttpGet("get-by-username/{username}")]
    public async Task<ActionResult<MemberDto>> GetUserByUsername(string username)
    {
        var user = await userRepository.GetMemberByUsernameAsync(username);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
        var user = await userRepository.GetUserByUsernameAsync(User.GetUsername());

        if (user == null)
        {
            return BadRequest("Could not find user!");
        }

        mapper.Map(memberUpdateDto, user);

        if (await userRepository.SaveAllAsync())
        {
            return NoContent();
        }
        else
        {
            return BadRequest("Failed to update the user!");
        }
    }

    [HttpPost("add-photos")]
    public async Task<ActionResult<List<PhotoDto>>> AddPhotos([FromForm] List<IFormFile> formFiles)
    {
        var user = await userRepository.GetUserByUsernameAsync(User.GetUsername());

        if (user == null)
        {
            return BadRequest("Cannot update user!");
        }


        var photos = new List<PhotoDto>();

        for (int i = 0; i < formFiles.Count; i++)
        {
            var result = await photoService.AddPhotoAsync(formFiles[i]);

            if (result.Error != null)
            {
                return BadRequest(result.Error.Message);
            }

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
            };

            if (i == 0 && user.Photos.Count == 0)
            {
                photo.IsMain = true;
            }

            user.Photos.Add(photo);
            photos.Add(mapper.Map<PhotoDto>(photo));
        }

        if (await userRepository.SaveAllAsync())
        {
            return CreatedAtAction(nameof(GetUserByUsername), new { username = user.UserName }, photos);
        }
        else
        {
            return BadRequest("Problem adding photo!");
        }
    }

    [HttpPut("set-main-photo/{photoId:int}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        var user = await userRepository.GetUserByUsernameAsync(User.GetUsername());

        if (user == null)
        {
            return BadRequest("Could not find user!");
        }

        var photo = user.Photos.FirstOrDefault(photo => photo.Id == photoId);

        if (photo == null || photo.IsMain)
        {
            return BadRequest("Cannot use it as main photo!");
        }

        var currentMain = user.Photos.FirstOrDefault(photo => photo.IsMain);

        if (currentMain != null)
        {
            currentMain.IsMain = false;
        }

        photo.IsMain = true;

        if (await userRepository.SaveAllAsync())
        {
            return NoContent();
        }
        else
        {
            return BadRequest("Problem setting main photo!");
        }
    }

    [HttpDelete("delete-photo/{photoId:int}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        var user = await userRepository.GetUserByUsernameAsync(User.GetUsername());

        if (user == null)
        {
            return BadRequest("User not found1");
        }

        var photo = user.Photos.FirstOrDefault(photo => photo.Id == photoId);

        if (photo == null || photo.IsMain)
        {
            return BadRequest("This photo cannot be deleted!");
        }

        if (photo.PublicId != null)
        {
            var result = await photoService.DeletePhotoAsync(photo.PublicId);

            if (result.Error != null)
            {
                return BadRequest(result.Error.Message);
            }

        }

        user.Photos.Remove(photo);

        if (await userRepository.SaveAllAsync())
        {
            return Ok();
        }
        else
        {
            return BadRequest("Problem deleting photo!");
        }
    }
}
