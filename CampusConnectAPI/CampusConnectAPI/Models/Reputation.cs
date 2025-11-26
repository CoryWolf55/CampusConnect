namespace CampusConnectAPI.Models
{
    public class Reputation
    {
        public int ProfileId { get; set; }
        public Profile Profile { get; set; }

        public string Category { get; set; } // e.g., "helpfulness", "activity"
        public int Score { get; set; }
    }
}
