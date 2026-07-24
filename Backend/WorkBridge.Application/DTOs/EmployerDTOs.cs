using System;
using System.Collections.Generic;

namespace WorkBridge.Application.DTOs
{
    public class EmployerProfileResponse
    {
        public int EmployerId { get; set; }
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string CompanyName { get; set; } = null!;
        public string ContactEmail { get; set; } = null!;
        public string? ContactPhone { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public int ReputationScore { get; set; }
        public int ReportCount { get; set; }
        public string Status { get; set; } = null!;
        public string VerificationStatus { get; set; } = "Pending";
        public string? BusinessLicenseUrl { get; set; }
        public string? TaxId { get; set; }
    }

    public class SubmitVerificationRequest
    {
        public string TaxId { get; set; } = null!;
        public string LegalCompanyName { get; set; } = null!;
        public string RegistrationAddress { get; set; } = null!;
        public string RepresentativeName { get; set; } = null!;
        public string? RepresentativeTitle { get; set; }
        public string? SubmissionNote { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile BusinessLicenseFile { get; set; } = null!;
        public Microsoft.AspNetCore.Http.IFormFile? SupportingDocumentFile { get; set; }
    }

    public class EmployerVerificationResponse
    {
        public int VerificationId { get; set; }
        public int EmployerId { get; set; }
        public string TaxId { get; set; } = string.Empty;
        public string LegalCompanyName { get; set; } = string.Empty;
        public string RegistrationAddress { get; set; } = string.Empty;
        public string RepresentativeName { get; set; } = string.Empty;
        public string? RepresentativeTitle { get; set; }
        public string BusinessLicenseUrl { get; set; } = string.Empty;
        public string? SupportingDocumentUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? SubmissionNote { get; set; }
        public string? ReviewNote { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
    }

    public class EmployerVerificationOverviewResponse
    {
        public string CurrentStatus { get; set; } = "Unverified";
        public bool CanSubmit { get; set; }
        public string? BlockingReason { get; set; }
        public EmployerVerificationResponse? LatestSubmission { get; set; }
        public List<EmployerVerificationResponse> History { get; set; } = new();
    }

    public class UpdateEmployerProfileRequest
    {
        public string CompanyName { get; set; } = null!;
        public string ContactEmail { get; set; } = null!;
        public string? ContactPhone { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
    }

    public class CreateJobRequest
    {
        public int CategoryId { get; set; }
        public int? BranchId { get; set; }
        public string Title { get; set; } = null!;
        public string JobType { get; set; } = null!;
        public decimal? PayRate { get; set; }
        public string PayUnit { get; set; } = null!;
        public string? City { get; set; }
        public string? District { get; set; }
        public string Address { get; set; } = null!;
        public DateTime? ApplicationDeadline { get; set; }
        public string? Position { get; set; }
        public int? Vacancies { get; set; }
        public string Description { get; set; } = null!;
        public string? Requirements { get; set; }
        public string? Benefits { get; set; }
        public string? WorkingHours { get; set; }
        public List<int> ShiftIds { get; set; } = new();
    }

    public class EmployerDashboardStats
    {
        public int JobPostCount { get; set; }
        public int TotalApplications { get; set; }
        public int SuitablePercentage { get; set; }
        public double Rating { get; set; }
        public int ReputationScore { get; set; }
    }
}
