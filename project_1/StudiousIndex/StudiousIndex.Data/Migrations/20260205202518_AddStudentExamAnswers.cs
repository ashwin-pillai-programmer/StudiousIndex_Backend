using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudiousIndex.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentExamAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StudentExamAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentExamId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    SelectedOptionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentExamAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentExamAnswers_Options_SelectedOptionId",
                        column: x => x.SelectedOptionId,
                        principalTable: "Options",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentExamAnswers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentExamAnswers_StudentExams_StudentExamId",
                        column: x => x.StudentExamId,
                        principalTable: "StudentExams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentExamAnswers_QuestionId",
                table: "StudentExamAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentExamAnswers_SelectedOptionId",
                table: "StudentExamAnswers",
                column: "SelectedOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentExamAnswers_StudentExamId",
                table: "StudentExamAnswers",
                column: "StudentExamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentExamAnswers");
        }
    }
}
