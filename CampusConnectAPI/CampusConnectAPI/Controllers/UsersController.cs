using CampusConnectAPI.DB;
using CampusConnectAPI.DTOs;
using CampusConnectAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

            // Extract email domain
            var emailDomain = login.Email.Split('@').Last();
            var campusName = emailDomain.Split('.').First();

            // Check if campus exists, otherwise create it
            var campus = await _context.Campuses
                .FirstOrDefaultAsync(c => c.EmailDomain == emailDomain);

            if (campus == null)
            {
                campus = new Campus
                {
                    Name = campusName, 
                    EmailDomain = emailDomain
                };
                _context.Campuses.Add(campus);
                await _context.SaveChangesAsync();
            }

            // Create profile
            var profile = new Profile
            {
                LoginId = (int)login.Id,
                CampusId = campus.Id,
                Username = ""
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

            // Get login to determine campus
            var login = await _context.Logins
                .FirstOrDefaultAsync(l => l.Id == request.LoginId);

            if (login == null)
                return BadRequest("Invalid LoginId.");

            var emailDomain = login.Email.Split('@').Last();

            var campus = await _context.Campuses
                .FirstOrDefaultAsync(c => c.EmailDomain == emailDomain);

            if (campus == null)
                return BadRequest("No campus found for this email domain.");

            // Fetch existing profile
            var profile = await _context.Profiles
                .Include(p => p.ProfileClubs)
                    .ThenInclude(pc => pc.Club)
                .Include(p => p.ProfileCourses)
                    .ThenInclude(pc => pc.Course)
                .FirstOrDefaultAsync(p => p.LoginId == request.LoginId);

            if (profile == null)
            {
                // CREATE
                profile = new Profile
                {
                    LoginId = request.LoginId,
                    Username = request.Username,
                    Major = request.Major,
                    Year = request.Year,
                    Description = request.Description,
                    CampusId = campus.Id 
                };

                _context.Profiles.Add(profile);
            }
            else
            {
                // UPDATE
                profile.Username = request.Username;
                profile.Major = request.Major;
                profile.Year = request.Year;
                profile.Description = request.Description;

                // Ensure campus is set (failsafe)
                if (profile.CampusId == 0)
                    profile.CampusId = campus.Id;

                profile.ProfileClubs.Clear();
                profile.ProfileCourses.Clear();
            }

            // Handle Clubs
            if (request.ProfileClubs != null)
            {
                foreach (var clubName in request.ProfileClubs
                    .Select(pc => pc.Club?.Name)
                    .Where(n => !string.IsNullOrWhiteSpace(n)))
                {
                    var club = await _context.Clubs
                        .FirstOrDefaultAsync(c => c.Name == clubName.Trim());

                    if (club == null)
                    {
                        club = new Club
                        {
                            Name = clubName.Trim(),
                            CampusId = campus.Id 
                        };
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
                foreach (var courseName in request.ProfileCourses
                    .Select(pc => pc.Course?.Name)
                    .Where(n => !string.IsNullOrWhiteSpace(n)))
                {
                    var course = await _context.Courses
                        .FirstOrDefaultAsync(c => c.Name == courseName.Trim());

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
        public async Task<ActionResult> AddProfileClubs([FromBody] ProfileClubsDto dto)
        {
            if (dto.ProfileId == 0 || dto.Clubs.Count == 0)
                return BadRequest("Invalid club data.");

            foreach (var clubName in dto.Clubs)
            {
                var trimmed = clubName.Trim();
                if (string.IsNullOrWhiteSpace(trimmed)) continue;

                var club = await _context.Clubs
                    .FirstOrDefaultAsync(c => c.Name == trimmed);

                if (club == null)
                {
                    club = new Club
                    {
                        Name = trimmed,
                        CampusId = 1
                    };
                    _context.Clubs.Add(club);
                    await _context.SaveChangesAsync();
                }

                bool exists = await _context.ProfileClubs.AnyAsync(pc =>
                    pc.ProfileId == dto.ProfileId && pc.ClubId == club.Id);

                if (!exists)
                {
                    _context.ProfileClubs.Add(new ProfileClub
                    {
                        ProfileId = dto.ProfileId,
                        ClubId = club.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: api/users/profile/courses
        [HttpPost("profile/courses")]
        public async Task<ActionResult> AddProfileCourses([FromBody] ProfileCoursesDto dto)
        {
            if (dto.ProfileId == 0 || dto.Courses.Count == 0)
                return BadRequest("Invalid course data.");

            foreach (var courseName in dto.Courses)
            {
                var trimmed = courseName.Trim();
                if (string.IsNullOrWhiteSpace(trimmed)) continue;

                var course = await _context.Courses
                    .FirstOrDefaultAsync(c => c.Name == trimmed);

                if (course == null)
                {
                    course = new Course { Name = trimmed };
                    _context.Courses.Add(course);
                    await _context.SaveChangesAsync();
                }

                bool exists = await _context.ProfileCourses.AnyAsync(pc =>
                    pc.ProfileId == dto.ProfileId && pc.CourseId == course.Id);

                if (!exists)
                {
                    _context.ProfileCourses.Add(new ProfileCourse
                    {
                        ProfileId = dto.ProfileId,
                        CourseId = course.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }


    }
}
