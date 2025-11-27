namespace CampusConnectAPI.Models
{
    public partial class Reputation
    {
        public int ProfileId { get; set; }
        public string Category { get; set; } = null!;
        public int Score { get; set; } = 0;

        public virtual Profile Profile { get; set; } = null!;
    }
}
