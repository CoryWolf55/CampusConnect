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
        public async Task<ActionResult<object>> GetThread(int threadId)
        {
            // Fetch the thread
            var thread = await _context.ForumThreads
                .FirstOrDefaultAsync(t => t.Id == threadId);

            if (thread == null) return NotFound("Thread not found");

            // Fetch the thread creator
            var threadCreator = await _context.Profiles
                .Where(p => p.Id == thread.CreatedById)
                .Select(p => new
                {
                    p.Id,
                    Username = string.IsNullOrEmpty(p.Username) ? $"User {p.Id}" : p.Username
                })
                .FirstOrDefaultAsync();

            // Fetch all posts in this thread with usernames
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
                            u.Id,
                            Username = string.IsNullOrEmpty(u.Username) ? $"User {u.Id}" : u.Username
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            var result = new
            {
                thread.Id,
                thread.Title,
                thread.CreatedAt,
                thread.CreatedById,
                CreatedBy = threadCreator,
                Posts = posts
            };

            return Ok(result);
        }


        // ===================== Create Post =====================
        [HttpPost("thread/{threadId}/posts")]
        public async Task<ActionResult<object>> CreatePost(int threadId, [FromBody] CreatePostRequest request)
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

            // Explicitly return the username
            var result = new
            {
                Id = post.Id,
                ThreadId = post.ThreadId,
                CreatedById = post.CreatedById,
                Content = post.Content,
                CreatedAt = post.CreatedAt,
                CreatedBy = new
                {
                    Username = user.Username
                }
            };

            return Ok(result);
        }

        [HttpGet("community/{communityId}/threads")]
        public async Task<ActionResult<IEnumerable<ForumThread>>> GetThreadsByCommunity(int communityId)
        {
            Console.WriteLine($"Fetching threads for communityId: {communityId}");
            var community = await _context.Communities.FindAsync(communityId);
            if (community == null)
            {
                Console.WriteLine("Community not found");
                return NotFound("Community not found");
            }

            var threads = await _context.ForumThreads
                .Include(t => t.CreatedBy)
                .Where(t => t.CommunityId == communityId)
                .ToListAsync();

            Console.WriteLine($"Found {threads.Count} threads");
            return Ok(threads);
        }
        [HttpPost("thread")]
        public async Task<ActionResult<object>> CreateThread([FromBody] CreateThreadRequest request)
        {
            // 1️⃣ Validate community and user
            var community = await _context.Communities.FindAsync(request.CommunityId);
            var user = await _context.Profiles.FindAsync(request.CreatedById);

            if (community == null) return NotFound("Community not found");
            if (user == null) return NotFound("User not found");

            // 2️⃣ Create new thread
            var thread = new ForumThread
            {
                CommunityId = request.CommunityId,
                CreatedById = request.CreatedById,
                Title = request.Title.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.ForumThreads.Add(thread);
            await _context.SaveChangesAsync();

            // 3️⃣ Reload thread with CreatedBy populated
            var fullThread = await _context.ForumThreads
                .Include(t => t.CreatedBy)  // ensure EF Core loads CreatedBy
                .Where(t => t.Id == thread.Id)
                .Select(t => new
                {
                    t.Id,
                    t.CommunityId,
                    t.Title,
                    t.CreatedAt,
                    t.CreatedById,
                    CreatedBy = new
                    {
                        t.CreatedBy.Id,
                        t.CreatedBy.Username
                    }
                })
                .FirstOrDefaultAsync();

            return Ok(fullThread);
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
}
