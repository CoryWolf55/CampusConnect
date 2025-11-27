using System;

namespace CampusConnectAPI.Models;

public partial class Post
{
    public int Id { get; set; }
    public int ThreadId { get; set; }
    public int CreatedById { get; set; }
    public string? Content { get; set; }
    public DateTime? CreatedAt { get; set; }

    public virtual Profile CreatedBy { get; set; } = null!;

    // Fixed: property name should match the relationship in AppDbContext
    public virtual ForumThread ForumThread { get; set; } = null!;
}
