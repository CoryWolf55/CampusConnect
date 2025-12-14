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

        // Register a new user
      //  [HttpPost("create_post")]
       // public async Task<ActionResult<Post>> CreateForum([FromBody] Post post)
       // {

       // }
    }}
