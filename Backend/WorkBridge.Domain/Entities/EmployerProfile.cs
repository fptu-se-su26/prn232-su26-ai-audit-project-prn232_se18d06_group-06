using System;
using System.Collections.Generic;

namespace WorkBridge.Domain.Entities;

public partial class EmployerProfile
{
    public int EmployerId { get; set; }

    public string CompanyName { get; set; } = null!;

    public string ContactEmail { get; set; } = null!;

    public string? ContactPhone { get; set; }

    public string? Address { get; set; }

    public string? Description { get; set; }

    public string? LogoUrl { get; set; }

    public int ReputationScore { get; set; } = 100;

    public int ReportCount { get; set; }

    public string Status { get; set; } = "Active";

    public virtual User Employer { get; set; } = null!;

    
}
