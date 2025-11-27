using System.Collections.Generic;

namespace CampusConnectAPI.Models
{
    public partial class Course
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public virtual ICollection<ProfileCourse> ProfileCourses { get; set; } = new List<ProfileCourse>();
    }
}
