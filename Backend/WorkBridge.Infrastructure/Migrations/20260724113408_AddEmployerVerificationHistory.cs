using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkBridge.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployerVerificationHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmployerVerifications",
                columns: table => new
                {
                    VerificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployerId = table.Column<int>(type: "int", nullable: false),
                    TaxId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LegalCompanyName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    RegistrationAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RepresentativeName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    RepresentativeTitle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BusinessLicenseUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SupportingDocumentUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    SubmissionNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReviewNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployerVerifications", x => x.VerificationId);
                    table.ForeignKey(
                        name: "FK_EmployerVerifications_EmployerProfiles_EmployerId",
                        column: x => x.EmployerId,
                        principalTable: "EmployerProfiles",
                        principalColumn: "EmployerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmployerVerifications_EmployerId_Status_SubmittedAt",
                table: "EmployerVerifications",
                columns: new[] { "EmployerId", "Status", "SubmittedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmployerVerifications");
        }
    }
}
