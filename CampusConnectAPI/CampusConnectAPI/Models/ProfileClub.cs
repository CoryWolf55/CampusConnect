namespace CampusConnectAPI.Models
{
    public class ProfileClub
    {
        public int? ProfileId { get; set; }
        public Profile? Profile { get; set; } = null!;

        public int ClubId { get; set; }
        public Club Club { get; set; } = null!;
    }
}
