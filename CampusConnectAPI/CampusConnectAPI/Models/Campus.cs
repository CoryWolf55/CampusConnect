namespace CampusConnectAPI.Models
{
    public class Campus
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string EmailDomain { get; set; }  // e.g., university.edu

        public ICollection<Club> Clubs { get; set; }
        public ICollection<Community> Communities { get; set; }
    }
}
