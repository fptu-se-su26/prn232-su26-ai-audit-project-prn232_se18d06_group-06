using WorkBridge.Application.DTOs;

namespace WorkBridge.Application.Services
{
    public interface IAdminService
    {
        // User Management
        Task<IEnumerable<AdminUserResponse>> GetUsersAsync();
        Task<bool> UpdateUserStatusAsync(int userId, string status);
        Task<bool> UpdateUserReputationAsync(int userId, int reputationScore);
    }
}
