using CampusConnectAPI.DB;
using CampusConnectAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CampusConnectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // Register a new user
        [HttpPost("register")]
        public async Task<ActionResult<Login>> Register([FromBody] Login login)
        {
            // Check if email already exists
            if (await _context.Logins.AnyAsync(l => l.Email == login.Email))
                return BadRequest("Email already registered");

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

            if (login == null) return NotFound(false);

            // NOTE: plain text password for prototype
            if (login.Password == loginDto.Password)
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

            if (login == null) return NotFound();

            return login;
        }
    }
}