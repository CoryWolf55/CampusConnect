namespace CampusConnectAPI.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<ProfileCourse> ProfileCourses { get; set; }
    }

    public class ProfileCourse
    {
        public int ProfileId { get; set; }
        public Profile Profile { get; set; }

        public int CourseId { get; set; }
        public Course Course { get; set; }
    }
}
