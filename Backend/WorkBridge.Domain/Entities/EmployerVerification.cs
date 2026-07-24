namespace WorkBridge.Domain.Entities;

public class EmployerVerification
{
    public int VerificationId { get; set; }
    public int EmployerId { get; set; }
    public string TaxId { get; set; } = null!;
    public string LegalCompanyName { get; set; } = null!;
    public string RegistrationAddress { get; set; } = null!;
    public string RepresentativeName { get; set; } = null!;
    public string? RepresentativeTitle { get; set; }
    public string BusinessLicenseUrl { get; set; } = null!;
    public string? SupportingDocumentUrl { get; set; }
    public string Status { get; set; } = "Pending";
    public string? SubmissionNote { get; set; }
    public string? ReviewNote { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public int? ReviewedByUserId { get; set; }
    public virtual EmployerProfile Employer { get; set; } = null!;
}
