using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using WorkBridge.Application.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkBridge.Application.DTOs;

namespace WorkBridge.Application.Services
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(int userId, string title, string message, string category = "General", string? actionUrl = null);
        Task<NotificationPageResponse> GetNotificationsAsync(int userId, int page, int pageSize, string? category, string? state, string? search);
        Task<bool> MarkAsReadAsync(int userId, int notificationId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> DeleteNotificationAsync(int userId, int notificationId);
        Task<bool> DeleteAllReadNotificationsAsync(int userId);
        Task<int> ArchiveNotificationsAsync(int userId, IEnumerable<int> notificationIds, bool archived);
        Task<int> DeleteNotificationsAsync(int userId, IEnumerable<int> notificationIds);
    }
}
