using System.Collections.Generic;

namespace CampusConnectAPI.Models;

public partial class Club
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int CampusId { get; set; }
    public virtual Campus Campus { get; set; } = null!;

    // Fixed: Use ProfileClubs for many-to-many
    public virtual ICollection<ProfileClub> ProfileClubs { get; set; } = new List<ProfileClub>();
}
