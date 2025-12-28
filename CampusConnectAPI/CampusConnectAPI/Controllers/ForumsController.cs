using CampusConnectAPI.DB;
using CampusConnectAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CampusConnectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForumsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ForumsController(AppDbContext context)
        {
            _context = context;
        }

        // ===================== Communities by Email =====================
        [HttpPost("community/by-email")]
        public async Task<IActionResult> GetCommunitiesWithThreads([FromBody] EmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email required");

            if (!request.Email.Contains("@"))
                return BadRequest("Invalid email");

            var domain = request.Email.Split('@').Last().Trim().ToLower();

            var campus = await _context.Campuses
                .Include(c => c.Communities)
                .FirstOrDefaultAsync(c =>
                    c.EmailDomain.ToLower().Trim() == domain
                );

            if (campus == null)
                return NotFound("Campus not found");

            return Ok(campus.Communities.Select(c => new
            {
                c.Id,
                c.Name
            }));
        }

        // ===================== Create Community =====================
        [HttpPost("community")]
        public async Task<IActionResult> CreateCommunity([FromBody] CreateCommunityRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Name required");

            var campus = await _context.Campuses
                .Include(c => c.Communities)
                .FirstOrDefaultAsync(c =>
                    c.EmailDomain.ToLower().Trim() ==
                    request.EmailDomain.ToLower().Trim()
                );

            if (campus == null)
                return NotFound("Campus not found");

            var community = new Community
            {
                Name = request.Name.Trim(),
                CampusId = campus.Id
            };

            // ✅ IMPORTANT FIX
            campus.Communities.Add(community);

            await _context.SaveChangesAsync();

            // ✅ Return same shape as fetch endpoint
            return Ok(new
            {
                community.Id,
                community.Name
            });
        }

        // ===================== Single Thread =====================
        [HttpGet("thread/{threadId}")]
        public async Task<ActionResult<object>> GetThread(int threadId)
        {
            var thread = await _context.ForumThreads
                .FirstOrDefaultAsync(t => t.Id == threadId);

            if (thread == null) return NotFound("Thread not found");

            // Normalize thread creator
            var threadCreator = await _context.Profiles
                .Where(p => p.Id == thread.CreatedById)
                .Select(p => new
                {
                    Id = p.Id,
                    Username = string.IsNullOrWhiteSpace(p.Username) ? $"User {p.Id}" : p.Username
                })
                .FirstOrDefaultAsync();

            // Normalize posts
            var posts = await _context.Posts
                .Where(p => p.ThreadId == threadId)
                .Select(p => new
                {
                    p.Id,
                    p.Content,
                    p.CreatedAt,
                    p.CreatedById,
                    CreatedBy = _context.Profiles
                        .Where(u => u.Id == p.CreatedById)
                        .Select(u => new
                        {
                            Id = u.Id,
                            Username = string.IsNullOrWhiteSpace(u.Username) ? $"User {u.Id}" : u.Username
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(new
            {
                thread.Id,
                thread.Title,
                thread.CreatedAt,
                thread.CreatedById,
                CreatedBy = threadCreator,
                Posts = posts
            });
        }

        // ===================== Create Post =====================
        [HttpPost("thread/{threadId}/posts")]
        public async Task<ActionResult<object>> CreatePost(int threadId, [FromBody] CreatePostRequest request)
        {
            var thread = await _context.ForumThreads.FindAsync(threadId);
            var user = await _context.Profiles
                .FirstOrDefaultAsync(p => p.LoginId == request.CreatedById);

            if (thread == null) return NotFound("Thread not found");
            if (user == null) return NotFound("User not found");

            var post = new Post
            {
                ThreadId = threadId,
                CreatedById = user.Id,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                post.Id,
                post.ThreadId,
                post.CreatedById,
                post.Content,
                post.CreatedAt,
                CreatedBy = new { user.Username }
            });
        }

        [HttpGet("community/{communityId}/threads")]
        public async Task<ActionResult<IEnumerable<ForumThread>>> GetThreadsByCommunity(int communityId)
        {
            var threads = await _context.ForumThreads
                .Include(t => t.CreatedBy)
                .Where(t => t.CommunityId == communityId)
                .ToListAsync();

            return Ok(threads);
        }

        [HttpPost("thread")]
        public async Task<ActionResult<object>> CreateThread([FromBody] CreateThreadRequest request)
        {
            var community = await _context.Communities.FindAsync(request.CommunityId);
            var user = await _context.Profiles
                .FirstOrDefaultAsync(p => p.LoginId == request.CreatedById);

            if (community == null) return NotFound("Community not found");
            if (user == null) return NotFound("User not found");

            var thread = new ForumThread
            {
                CommunityId = request.CommunityId,
                CreatedById = user.Id,
                Title = request.Title.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.ForumThreads.Add(thread);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                thread.Id,
                thread.CommunityId,
                thread.Title,
                thread.CreatedAt,
                thread.CreatedById,
                CreatedBy = new { user.Id, user.Username }
            });
        }
    }

    // ===================== Request Models =====================
    public class CreateThreadRequest
    {
        public int CommunityId { get; set; }
        public int CreatedById { get; set; }
        public string Title { get; set; } = null!;
    }

    public class CreateCommunityRequest
    {
        public string Name { get; set; } = null!;
        public string EmailDomain { get; set; } = null!;
    }

    public class CreatePostRequest
    {
        public int CreatedById { get; set; }
        public string Content { get; set; } = null!;
    }

    public class EmailRequest
    {
        public string Email { get; set; } = null!;
    }
}
