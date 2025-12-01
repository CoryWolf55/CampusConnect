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
                return true;

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

        [HttpPost("profile")]
        public async Task<ActionResult<Login>> Profile([FromBody] Profile profile)
        {
            
        }
    }
}
