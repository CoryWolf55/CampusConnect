using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CampusConnectAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileCampusRelationFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CampusId",
                table: "Profiles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_CampusId",
                table: "Profiles",
                column: "CampusId");

            migrationBuilder.AddForeignKey(
                name: "FK_Profiles_Campuses_CampusId",
                table: "Profiles",
                column: "CampusId",
                principalTable: "Campuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Profiles_Campuses_CampusId",
                table: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_Profiles_CampusId",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "CampusId",
                table: "Profiles");
        }
    }
}
