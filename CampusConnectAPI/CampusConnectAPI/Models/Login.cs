namespace CampusConnectAPI.Models
{
    public partial class Login
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public int? ProfileId { get; set; }

        public virtual Profile? Profile { get; set; }
    }
}
