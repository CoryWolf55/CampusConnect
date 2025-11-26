namespace CampusConnectAPI.Models
{
    public class Club
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CampusId { get; set; }
        public Campus Campus { get; set; }

        public ICollection<ProfileClub> ProfileClubs { get; set; }
    }

    public class ProfileClub
    {
        public int ProfileId { get; set; }
        public Profile Profile { get; set; }

        public int ClubId { get; set; }
        public Club Club { get; set; }
    }
}
