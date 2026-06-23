using System;
using System.Collections.Generic;

namespace WorkBridge.Application.DTOs
{
    public class AdminUserResponse
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? ReputationScore { get; set; }
        public int? ReportCount { get; set; }
        public bool IsVip { get; set; }
        public int? VipSubscriptionId { get; set; }
        public int? VipPlanId { get; set; }
        public string? VipPlanName { get; set; }
        public string? VipAudience { get; set; }
        public DateTime? VipStartDate { get; set; }
        public DateTime? VipEndDate { get; set; }
        public int? VipDaysRemaining { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
