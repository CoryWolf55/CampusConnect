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

  
        [HttpPost("register")]
        public async Task<ActionResult<Login>> Register([FromBody] Login login)
        {
            if (await _context.Logins.AnyAsync(l => l.Email == login.Email))
                return BadRequest("Email already registered");

            string plainPassword = login.PasswordHash;
            login.PasswordHash = _hasher.HashPassword(login, plainPassword);

            _context.Logins.Add(login);
            await _context.SaveChangesAsync();

            var profile = new Profile
            {
                LoginId = (int)login.Id,
                Username = "",
            };

            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            login.ProfileId = profile.Id;
            login.Profile = profile;
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLogin), new { email = login.Email }, login);
        }

   
        [HttpPost("validate")]
        public async Task<ActionResult<object>> Validate([FromBody] Login loginDto)
        {
            var login = await _context.Logins
                .Include(l => l.Profile)
                .FirstOrDefaultAsync(l => l.Email == loginDto.Email);

            if (login == null)
                return NotFound(false);

            var result = _hasher.VerifyHashedPassword(login, login.PasswordHash, loginDto.PasswordHash);

            if (result == PasswordVerificationResult.Success)
                return Ok(new { id = login.Id, email = login.Email });

            return Unauthorized();
        }

     
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

        [HttpGet("profile/by-login/{loginId}")]
        public async Task<ActionResult<object>> GetProfileByLoginId(int loginId)
        {
            var profile = await _context.Profiles
                .Include(p => p.ProfileClubs)
                    .ThenInclude(pc => pc.Club)
                .Include(p => p.ProfileCourses)
                    .ThenInclude(pc => pc.Course)
                .FirstOrDefaultAsync(p => p.LoginId == loginId);

            if (profile == null)
                return NotFound();

            // Return a DTO with club/course names
            var profileDto = new
            {
                profile.Id,
                profile.Username,
                profile.Major,
                profile.Year,
                profile.Description,
                profile.LoginId,
                profileClubs = profile.ProfileClubs?.Select(pc => pc.Club.Name).ToList() ?? new List<string>(),
                profileCourses = profile.ProfileCourses?.Select(pc => pc.Course.Name).ToList() ?? new List<string>()
            };

            return Ok(profileDto);
        }


        [HttpPost("profile")]
        public async Task<ActionResult<Profile>> RegisterOrUpdateProfile([FromBody] Profile request)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);


            if (request.LoginId == 0)
                return BadRequest("LoginId is required.");

            // Fetch the profile including clubs/courses
            var profile = await _context.Profiles
                .Include(p => p.ProfileClubs)
                    .ThenInclude(pc => pc.Club)
                .Include(p => p.ProfileCourses)
                    .ThenInclude(pc => pc.Course)
                .FirstOrDefaultAsync(p => p.LoginId == request.LoginId);

            if (profile == null)
            {
                // Profile doesn't exist yet, create it
                profile = new Profile
                {
                    LoginId = request.LoginId,
                    Username = request.Username,
                    Major = request.Major,
                    Year = request.Year,
                    Description = request.Description,
                };
                _context.Profiles.Add(profile);
            }
            else
            {
                // Update existing profile
                profile.Username = request.Username;
                profile.Major = request.Major;
                profile.Year = request.Year;
                profile.Description = request.Description;

                // Clear existing clubs/courses
                profile.ProfileClubs.Clear();
                profile.ProfileCourses.Clear();
            }

            // Handle Clubs
            if (request.ProfileClubs != null)
            {
                foreach (var clubName in request.ProfileClubs.Select(pc => pc.Club?.Name).Where(n => !string.IsNullOrWhiteSpace(n)))
                {
                    var club = await _context.Clubs.FirstOrDefaultAsync(c => c.Name == clubName.Trim());
                    if (club == null)
                    {
                        club = new Club { Name = clubName.Trim() };
                        _context.Clubs.Add(club);
                    }

                    profile.ProfileClubs.Add(new ProfileClub
                    {
                        Profile = profile,
                        Club = club
                    });
                }
            }

            // Handle Courses
            if (request.ProfileCourses != null)
            {
                foreach (var courseName in request.ProfileCourses.Select(pc => pc.Course?.Name).Where(n => !string.IsNullOrWhiteSpace(n)))
                {
                    var course = await _context.Courses.FirstOrDefaultAsync(c => c.Name == courseName.Trim());
                    if (course == null)
                    {
                        course = new Course { Name = courseName.Trim() };
                        _context.Courses.Add(course);
                    }

                    profile.ProfileCourses.Add(new ProfileCourse
                    {
                        Profile = profile,
                        Course = course
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(profile);
        }

        // POST: api/users/profile/clubs
        [HttpPost("profile/clubs")]
        public async Task<ActionResult> AddProfileClubs([FromBody] List<ProfileClub> clubs)
        {
            if (clubs == null || !clubs.Any())
                return BadRequest("No clubs provided.");

            foreach (var pc in clubs)
            {
                // Check if club exists, otherwise create
                var existingClub = await _context.Clubs.FirstOrDefaultAsync(c => c.Name == pc.Club.Name);
                if (existingClub == null)
                {
                    existingClub = new Club
                    {
                        Name = pc.Club.Name,
                        CampusId = 1 // or assign a default campus if needed
                    };
                    _context.Clubs.Add(existingClub);
                    await _context.SaveChangesAsync();
                }

                // Prevent duplicates
                var exists = await _context.ProfileClubs
                    .AnyAsync(c => c.ProfileId == pc.ProfileId && c.ClubId == existingClub.Id);
                if (!exists)
                {
                    _context.ProfileClubs.Add(new ProfileClub
                    {
                        ProfileId = pc.ProfileId,
                        ClubId = existingClub.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: api/users/profile/courses
        [HttpPost("profile/courses")]
        public async Task<ActionResult> AddProfileCourses([FromBody] List<ProfileCourse> courses)
        {
            if (courses == null || !courses.Any())
                return BadRequest("No courses provided.");

            foreach (var pc in courses)
            {
                // Check if course exists, otherwise create
                var existingCourse = await _context.Courses.FirstOrDefaultAsync(c => c.Name == pc.Course.Name);
                if (existingCourse == null)
                {
                    existingCourse = new Course
                    {
                        Name = pc.Course.Name
                    };
                    _context.Courses.Add(existingCourse);
                    await _context.SaveChangesAsync();
                }

                // Prevent duplicates
                var exists = await _context.ProfileCourses
                    .AnyAsync(c => c.ProfileId == pc.ProfileId && c.CourseId == existingCourse.Id);
                if (!exists)
                {
                    _context.ProfileCourses.Add(new ProfileCourse
                    {
                        ProfileId = pc.ProfileId,
                        CourseId = existingCourse.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }


        // Get communities by email domain
        [HttpPost("community")]
        public async Task<ActionResult<IEnumerable<Community>>> GetCommunities([FromBody] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email is required.");

            var emailDomain = email.Split('@').Last();

            var campus = await _context.Campuses
                .Include(c => c.Communities)
                .FirstOrDefaultAsync(c => c.EmailDomain == emailDomain);

            if (campus == null)
                return NotFound();

            return Ok(campus.Communities);
        }

    }
}
