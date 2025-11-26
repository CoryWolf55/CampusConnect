namespace CampusConnectAPI.Models
{
    public class Community
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsPrivate { get; set; }
        public int CampusId { get; set; }
        public Campus Campus { get; set; }

        public ICollection<Thread> Threads { get; set; }
    }

    public class Thread
    {
        public int Id { get; set; }
        public int CommunityId { get; set; }
        public Community Community { get; set; }

        public string Title { get; set; }
        public int CreatedById { get; set; }  // FK to Profile
        public Profile CreatedBy { get; set; }

        public ICollection<Post> Posts { get; set; }
    }

    public class Post
    {
        public int Id { get; set; }
        public int ThreadId { get; set; }
        public Thread Thread { get; set; }

        public int CreatedById { get; set; } // FK to Profile
        public Profile CreatedBy { get; set; }

        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
