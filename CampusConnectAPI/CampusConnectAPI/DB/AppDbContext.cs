using Microsoft.EntityFrameworkCore;
using CampusConnectAPI.Models;

namespace CampusConnectAPI.DB
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Login> Logins { get; set; }
        public DbSet<Campus> Campuses { get; set; }
        public DbSet<Club> Clubs { get; set; }
        public DbSet<ProfileClub> ProfileClubs { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<ProfileCourse> ProfileCourses { get; set; }
        public DbSet<Community> Communities { get; set; }
        public DbSet<ForumThread> ForumThreads { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Reputation> Reputations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ====================== ProfileClub (Many-to-Many) ======================
            modelBuilder.Entity<ProfileClub>()
                .HasKey(pc => new { pc.ProfileId, pc.ClubId });

            modelBuilder.Entity<ProfileClub>()
                .HasOne(pc => pc.Profile)
                .WithMany(p => p.ProfileClubs)
                .HasForeignKey(pc => pc.ProfileId);

            modelBuilder.Entity<ProfileClub>()
                .HasOne(pc => pc.Club)
                .WithMany(c => c.ProfileClubs)
                .HasForeignKey(pc => pc.ClubId);

            // ====================== ProfileCourse (Many-to-Many) ======================
            modelBuilder.Entity<ProfileCourse>()
                .HasKey(pc => new { pc.ProfileId, pc.CourseId });

            modelBuilder.Entity<ProfileCourse>()
                .HasOne(pc => pc.Profile)
                .WithMany(p => p.ProfileCourses)
                .HasForeignKey(pc => pc.ProfileId);

            modelBuilder.Entity<ProfileCourse>()
                .HasOne(pc => pc.Course)
                .WithMany(c => c.ProfileCourses)
                .HasForeignKey(pc => pc.CourseId);

            // ====================== Reputations ======================
            modelBuilder.Entity<Reputation>()
                .HasKey(r => new { r.ProfileId, r.Category });

            // ====================== ForumThread CreatedAt fix ======================
            modelBuilder.Entity<ForumThread>()
                .Property(t => t.CreatedAt)
                .HasColumnType("datetime")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // ====================== Post CreatedAt fix ======================
            modelBuilder.Entity<Post>()
                .Property(p => p.CreatedAt)
                .HasColumnType("datetime")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // ====================== Optional: Configure relationships ======================
            modelBuilder.Entity<Club>()
                .HasOne(c => c.Campus)
                .WithMany(ca => ca.Clubs)
                .HasForeignKey(c => c.CampusId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Community>()
                .HasOne(c => c.Campus)
                .WithMany(ca => ca.Communities)
                .HasForeignKey(c => c.CampusId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ForumThread>()
                .HasOne(t => t.Community)
                .WithMany(c => c.ForumThreads)
                .HasForeignKey(t => t.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ForumThread>()
                .HasOne(t => t.CreatedBy)
                .WithMany(p => p.ForumThreads)
                .HasForeignKey(t => t.CreatedById)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Post>()
                .HasOne(p => p.ForumThread)
                .WithMany(t => t.Posts)
                .HasForeignKey(p => p.ThreadId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Post>()
                .HasOne(p => p.CreatedBy)
                .WithMany(pr => pr.Posts)
                .HasForeignKey(p => p.CreatedById)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Login>()
                .HasOne(l => l.Profile)
                .WithOne(p => p.Login)
                .HasForeignKey<Login>(l => l.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
