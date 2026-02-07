using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudiousIndex.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddExamDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Board",
                table: "Exams",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "Exams",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledDate",
                table: "Exams",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Board",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "ScheduledDate",
                table: "Exams");
        }
    }
}
