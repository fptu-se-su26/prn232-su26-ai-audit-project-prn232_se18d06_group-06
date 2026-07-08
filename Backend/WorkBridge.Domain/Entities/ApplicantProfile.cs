using System;
using System.Collections.Generic;

namespace WorkBridge.Domain.Entities;

public partial class ApplicantProfile
{
    public int ApplicantId { get; set; }

    public string? University { get; set; }

    public string? Major { get; set; }

    public string? StudyYear { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? AboutMe { get; set; }

    public string? Availability { get; set; }

    public string? CvUrl { get; set; }

    public int ReputationScore { get; set; } = 100;

    public int ReportCount { get; set; }

   
}
