using System.Collections.Generic;

namespace CampusConnectAPI.Models;

public partial class Community
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public sbyte? IsPrivate { get; set; }
    public int CampusId { get; set; }

    public virtual Campus Campus { get; set; } = null!;
    // Fixed: Collection name pluralized
    public virtual ICollection<ForumThread> ForumThreads { get; set; } = new List<ForumThread>();
}
