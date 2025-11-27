namespace CampusConnectAPI.Models
{
    public class ProfileCourse
    {
        public int ProfileId { get; set; }
        public Profile Profile { get; set; } = null!;

        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
    }
}
