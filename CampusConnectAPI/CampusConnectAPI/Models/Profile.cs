using System;
using System.Collections.Generic;

namespace CampusConnectAPI.Models;

public partial class Profile
{
    public int? Id { get; set; }
    public string? Username { get; set; } = null!;
    public string? Major { get; set; }
    public int? Year { get; set; }
    public string? Description { get; set; }

    public virtual Login? Login { get; set; }
    public virtual ICollection<Post>? Posts { get; set; } = new List<Post>();
    public virtual ICollection<ForumThread>? ForumThreads { get; set; } = new List<ForumThread>();
    public virtual ICollection<Reputation>? Reputations { get; set; } = new List<Reputation>();

    // Fixed: Use join entities for many-to-many
    public virtual ICollection<ProfileClub>? ProfileClubs { get; set; } = new List<ProfileClub>();
    public virtual ICollection<ProfileCourse>? ProfileCourses { get; set; } = new List<ProfileCourse>();
}
