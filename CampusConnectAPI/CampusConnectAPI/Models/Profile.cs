namespace CampusConnectAPI.Models
{
    public class Profile
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Major { get; set; }
        public int Year { get; set; }
        public string Description { get; set; }

        public Login Login { get; set; }                      // navigation back to Login
        public ICollection<ProfileCourse> ProfileCourses { get; set; }
        public ICollection<ProfileClub> ProfileClubs { get; set; }
        public ICollection<Thread> Threads { get; set; }      // threads created
        public ICollection<Post> Posts { get; set; }          // posts created
        public ICollection<Reputation> Reputations { get; set; }
    }
}
