using System;
using System.Collections.Generic;

namespace CampusConnectAPI.Models
{
    public partial class ForumThread
    {
        public int Id { get; set; }
        public int CommunityId { get; set; }
        public int CreatedById { get; set; }
        public string Title { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Community Community { get; set; } = null!;
        public virtual Profile CreatedBy { get; set; } = null!;
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    }
}
