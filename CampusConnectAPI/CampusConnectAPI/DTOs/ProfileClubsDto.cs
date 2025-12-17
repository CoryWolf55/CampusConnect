namespace CampusConnectAPI.DTOs
{
    public class ProfileClubsDto
    {
        public int ProfileId { get; set; }
        public List<string> Clubs { get; set; } = new();
    }
}