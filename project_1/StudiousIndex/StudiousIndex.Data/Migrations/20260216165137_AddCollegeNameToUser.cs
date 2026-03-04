using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudiousIndex.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCollegeNameToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CollegeName",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "StudentResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StudentId = table.Column<string>(type: "TEXT", nullable: false),
                    TotalMarks = table.Column<int>(type: "INTEGER", nullable: false),
                    ObtainedMarks = table.Column<int>(type: "INTEGER", nullable: false),
                    Percentage = table.Column<double>(type: "REAL", nullable: false),
                    Grade = table.Column<string>(type: "TEXT", nullable: false),
                    Rank = table.Column<int>(type: "INTEGER", nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentResults_AspNetUsers_StudentId",
                        column: x => x.StudentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubjectResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StudentResultId = table.Column<int>(type: "INTEGER", nullable: false),
                    Subject = table.Column<string>(type: "TEXT", nullable: false),
                    TotalMarks = table.Column<int>(type: "INTEGER", nullable: false),
                    ObtainedMarks = table.Column<int>(type: "INTEGER", nullable: false),
                    Percentage = table.Column<double>(type: "REAL", nullable: false),
                    Grade = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubjectResults_StudentResults_StudentResultId",
                        column: x => x.StudentResultId,
                        principalTable: "StudentResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentResults_StudentId",
                table: "StudentResults",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectResults_StudentResultId",
                table: "SubjectResults",
                column: "StudentResultId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubjectResults");

            migrationBuilder.DropTable(
                name: "StudentResults");

            migrationBuilder.DropColumn(
                name: "CollegeName",
                table: "AspNetUsers");
        }
    }
}
