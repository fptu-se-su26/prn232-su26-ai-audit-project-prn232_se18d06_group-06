using WorkBridge.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using WorkBridge.Application.DTOs;

namespace WorkBridge.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IWorkBridgeContext _context;
        private readonly INotificationService _notificationService;

        public AdminService(IWorkBridgeContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        // User Management
        public async Task<IEnumerable<AdminUserResponse>> GetUsersAsync()
        {
            var now = DateTime.UtcNow;
            var users = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.ApplicantProfile)
                .Include(u => u.EmployerProfile)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            var userIds = users.Select(u => u.UserId).ToList();
            var activeSubscriptions = await _context.Subscriptions
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.Status == "Active" &&
                            s.EndDate >= now &&
                            ((s.UserId.HasValue && userIds.Contains(s.UserId.Value)) ||
                             (s.EmployerId.HasValue && userIds.Contains(s.EmployerId.Value))))
                .ToListAsync();

            return users.Select(u =>
            {
                var roleName = u.Role.RoleName;
                var activeVip = activeSubscriptions
                    .Where(s => roleName == "Employer"
                        ? ((s.UserId == u.UserId && s.Audience == "Employer") || s.EmployerId == u.UserId)
                        : roleName == "Applicant" && s.UserId == u.UserId && s.Audience == "Applicant")
                    .OrderByDescending(s => s.EndDate)
                    .FirstOrDefault();

                return new AdminUserResponse
                {
                    UserId = u.UserId,
                    Email = u.Email,
                    FullName = u.FullName,
                    RoleName = roleName,
                    Status = u.Status,
                    ReputationScore = roleName == "Employer"
                        ? u.EmployerProfile != null ? u.EmployerProfile.ReputationScore : null
                        : roleName == "Applicant"
                            ? u.ApplicantProfile != null ? u.ApplicantProfile.ReputationScore : null
                            : null,
                    ReportCount = roleName == "Employer"
                        ? u.EmployerProfile != null ? u.EmployerProfile.ReportCount : null
                        : roleName == "Applicant"
                            ? u.ApplicantProfile != null ? u.ApplicantProfile.ReportCount : null
                            : null,
                    IsVip = activeVip != null,
                    VipSubscriptionId = activeVip?.SubscriptionId,
                    VipPlanId = activeVip?.SubscriptionPlanId,
                    VipPlanName = activeVip?.SubscriptionPlan?.Name ?? activeVip?.PlanName,
                    VipAudience = activeVip?.Audience,
                    VipStartDate = activeVip?.StartDate,
                    VipEndDate = activeVip?.EndDate,
                    VipDaysRemaining = activeVip != null ? (int)Math.Ceiling((activeVip.EndDate - now).TotalDays) : null,
                    CreatedAt = u.CreatedAt
                };
            }).ToList();
        }

        public async Task<bool> UpdateUserStatusAsync(int userId, string status)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Status = status;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserReputationAsync(int userId, int reputationScore)
        {
            var score = Math.Clamp(reputationScore, 0, 100);
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.ApplicantProfile)
                .Include(u => u.EmployerProfile)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return false;

            if (user.Role.RoleName == "Employer")
            {
                if (user.EmployerProfile == null) return false;

                user.EmployerProfile.ReputationScore = score;
            }
            else if (user.Role.RoleName == "Applicant")
            {
                if (user.ApplicantProfile == null) return false;

                user.ApplicantProfile.ReputationScore = score;
            }
            else
            {
                return false;
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
