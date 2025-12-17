using CampusConnectAPI.Models;

public partial class Profile
{
    public int Id { get; set; } // make non-nullable for PK
    public string Username { get; set; } = null!;
    public string? Major { get; set; }
    public int? Year { get; set; }
    public string? Description { get; set; }

    // Add this:
    public int LoginId { get; set; }  // scalar FK
    public virtual Login? Login { get; set; } = null!;
    public int? CampusId { get; set; }
    public Campus? Campus { get; set; }

    public virtual ICollection<Post>? Posts { get; set; } = new List<Post>();
    public virtual ICollection<ForumThread>? ForumThreads { get; set; } = new List<ForumThread>();
    public virtual ICollection<Reputation>? Reputations { get; set; } = new List<Reputation>();

    public virtual ICollection<ProfileClub>? ProfileClubs { get; set; } = new List<ProfileClub>();
    public virtual ICollection<ProfileCourse>? ProfileCourses { get; set; } = new List<ProfileCourse>();
}
