using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudiousIndex.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPracticeEnabledToExam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPractice",
                table: "StudentExams",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPracticeEnabled",
                table: "Exams",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPractice",
                table: "StudentExams");

            migrationBuilder.DropColumn(
                name: "IsPracticeEnabled",
                table: "Exams");
        }
    }
}
