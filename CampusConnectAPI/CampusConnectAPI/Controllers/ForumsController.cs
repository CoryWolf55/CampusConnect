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

        // ===================== Communities by Email (with threads) =====================
        [HttpPost("community/by-email")]
        public async Task<ActionResult<IEnumerable<Community>>> GetCommunitiesWithThreads([FromBody] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email required");

            var domain = email.Split('@').Last();

            var campus = await _context.Campuses
                .Include(c => c.Communities)
                    .ThenInclude(comm => comm.ForumThreads)
                        .ThenInclude(t => t.CreatedBy)
                .Include(c => c.Communities)
                    .ThenInclude(comm => comm.ForumThreads)
                        .ThenInclude(t => t.Posts)
                            .ThenInclude(p => p.CreatedBy)
                .FirstOrDefaultAsync(c => c.EmailDomain == domain);

            if (campus == null)
                return NotFound("Campus not found");

            return Ok(campus.Communities);
        }

        // ===================== Create Community =====================
        [HttpPost("community")]
        public async Task<ActionResult<Community>> CreateCommunity([FromBody] CreateCommunityRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Name required");

            var campus = await _context.Campuses.FirstOrDefaultAsync(c => c.EmailDomain == request.EmailDomain);
            if (campus == null) return NotFound("Campus not found");

            var community = new Community
            {
                Name = request.Name.Trim(),
                CampusId = campus.Id
            };

            _context.Communities.Add(community);
            await _context.SaveChangesAsync();

            return Ok(community);
        }

        // ===================== Single Thread =====================
        [HttpGet("thread/{threadId}")]
        public async Task<ActionResult<ForumThread>> GetThread(int threadId)
        {
            var thread = await _context.ForumThreads
                .Include(t => t.CreatedBy)
                .Include(t => t.Posts)
                    .ThenInclude(p => p.CreatedBy)
                .FirstOrDefaultAsync(t => t.Id == threadId);

            if (thread == null) return NotFound("Thread not found");
            return Ok(thread);
        }

        // ===================== Create Post =====================
        [HttpPost("thread/{threadId}/posts")]
        public async Task<ActionResult<Post>> CreatePost(int threadId, [FromBody] CreatePostRequest request)
        {
            var thread = await _context.ForumThreads.FindAsync(threadId);
            var user = await _context.Profiles.FindAsync(request.CreatedById);

            if (thread == null) return NotFound("Thread not found");
            if (user == null) return NotFound("User not found");

            var post = new Post
            {
                ThreadId = threadId,
                CreatedById = request.CreatedById,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            post.CreatedBy = user; // return author info
            return Ok(post);
        }
    }

    // ===================== Request Models =====================
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
}
