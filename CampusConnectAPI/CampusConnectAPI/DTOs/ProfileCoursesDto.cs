namespace CampusConnectAPI.DTOs
{
    public class ProfileCoursesDto
    {
        public int ProfileId { get; set; }
        public List<string> Courses { get; set; } = new();
    }
}