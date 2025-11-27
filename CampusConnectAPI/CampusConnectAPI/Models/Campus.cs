using System.Collections.Generic;

namespace CampusConnectAPI.Models
{
    public partial class Campus
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string EmailDomain { get; set; } = null!;

        public virtual ICollection<Club> Clubs { get; set; } = new List<Club>();
        public virtual ICollection<Community> Communities { get; set; } = new List<Community>();
    }
}
