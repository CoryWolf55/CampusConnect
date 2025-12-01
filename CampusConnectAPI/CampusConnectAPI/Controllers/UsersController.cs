using CampusConnectAPI.DB;
using CampusConnectAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace CampusConnectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher<Login> _hasher;

        public UsersController(AppDbContext context)
        {
            _context = context;
            _hasher = new PasswordHasher<Login>();
        }

        // Register a new user
        [HttpPost("register")]
        public async Task<ActionResult<Login>> Register([FromBody] Login login)
        {
            // Check if email already exists
            if (await _context.Logins.AnyAsync(l => l.Email == login.Email))
                return BadRequest("Email already registered");

            // Hash the password BEFORE saving
            string plainPassword = login.PasswordHash;
            login.PasswordHash = _hasher.HashPassword(login, plainPassword);

            _context.Logins.Add(login);
            await _context.SaveChangesAsync();

            // Create an empty profile linked to this login
            var profile = new Profile
            {
                Username = "",          
                Major = null,
                Year = null,
                Description = null,
                Login = login           // link profile to newly created login
            };

            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            // Optionally set the reverse navigation property
            login.Profile = profile;
            login.ProfileId = profile.Id;
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLogin), new { email = login.Email }, login);
        }

        // Validate login credentials
        [HttpPost("validate")]
        public async Task<ActionResult<bool>> Validate([FromBody] Login loginDto)
        {
            var login = await _context.Logins
                .Include(l => l.Profile)
                .FirstOrDefaultAsync(l => l.Email == loginDto.Email);

            if (login == null)
                return NotFound(false);

            // Compare hashed password
            var result = _hasher.VerifyHashedPassword(login, login.PasswordHash, loginDto.PasswordHash);

            if (result == PasswordVerificationResult.Success)
                return Ok(new { id = login.Id, email = login.Email });  // return ID and email

            return false;
        }

        // Get login info by email
        [HttpGet("{email}")]
        public async Task<ActionResult<Login>> GetLogin(string email)
        {
            var login = await _context.Logins
                .Include(l => l.Profile)
                .FirstOrDefaultAsync(l => l.Email == email);

            if (login == null)
                return NotFound();

            return login;
        }

        [HttpGet("profile/{id}")]
        public async Task<ActionResult<bool>> GetProfile(int id)
        {
            var profile = await _context.Profiles
                .Include(p => p.Login)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (profile == null)
                return NotFound();

            if (profile.Username == null || profile.Username == "")
                return false;

            return true;
        }

        [HttpPost("profile")]
        public async Task<ActionResult<Profile>> Profile([FromBody] Profile request)
        {
            // Find the profile using the linked login
            var profile = await _context.Profiles
                .Include(p => p.Login)                 // include the login navigation
                .FirstOrDefaultAsync(p => p.Login!.Id == request.Login!.Id);

            if (profile == null)
                return NotFound("Profile not found");

            // Update profile fields
            profile.Username = request.Username;
            profile.Major = request.Major;
            profile.Year = request.Year;
            profile.Description = request.Description;
            profile.ProfileClubs = request.ProfileClubs;
            profile.ProfileCourses = request.ProfileCourses;

            await _context.SaveChangesAsync();

            return Ok(profile);
        }
    }
}
