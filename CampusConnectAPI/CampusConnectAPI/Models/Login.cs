namespace CampusConnectAPI.Models
{
    public class Login
    {
        public int Id { get; set; }
        public string Email { get; set; }          // source of truth
        public string PasswordHash { get; set; }   // store hashed passwords
        public int? ProfileId { get; set; }        // optional at first
        public Profile Profile { get; set; }       // navigation property
    }
}
