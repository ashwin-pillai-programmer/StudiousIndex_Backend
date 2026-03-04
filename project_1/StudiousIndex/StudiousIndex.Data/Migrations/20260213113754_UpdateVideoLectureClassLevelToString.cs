using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudiousIndex.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVideoLectureClassLevelToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ClassLevel",
                table: "VideoLectures",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ClassLevel",
                table: "VideoLectures",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");
        }
    }
}
