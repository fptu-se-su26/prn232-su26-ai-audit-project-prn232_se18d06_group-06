using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkBridge.Application.Services;
using WorkBridge.Application.DTOs;

namespace WorkBridge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private int GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userIdString, out int userId) ? userId : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 12,
            [FromQuery] string? category = null, [FromQuery] string? state = null, [FromQuery] string? search = null)
        {
            var userId = GetUserId();
            var notifications = await _notificationService.GetNotificationsAsync(userId, page, pageSize, category, state, search);
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetUserId();
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetUserId();
            var success = await _notificationService.MarkAsReadAsync(userId, id);
            if (!success) return NotFound(new { message = "Không tìm thấy thông báo." });
            return Ok(new { message = "Đã đánh dấu thông báo là đã đọc." });
        }
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserId();
            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { message = "Đã đánh dấu tất cả thông báo là đã đọc." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = GetUserId();
            var success = await _notificationService.DeleteNotificationAsync(userId, id);
            if (!success) return NotFound(new { message = "Không tìm thấy thông báo." });
            return Ok(new { message = "Đã xóa thông báo." });
        }

        [HttpDelete("delete-read")]
        public async Task<IActionResult> DeleteAllRead()
        {
            var userId = GetUserId();
            await _notificationService.DeleteAllReadNotificationsAsync(userId);
            return Ok(new { message = "Đã xóa tất cả thông báo đã đọc." });
        }
        [HttpPatch("archive")]
        public async Task<IActionResult> Archive([FromBody] NotificationBulkRequest request, [FromQuery] bool archived = true)
        {
            var count = await _notificationService.ArchiveNotificationsAsync(GetUserId(), request.NotificationIds, archived);
            return Ok(new { count });
        }

        [HttpDelete("bulk")]
        public async Task<IActionResult> DeleteBulk([FromBody] NotificationBulkRequest request)
        {
            var count = await _notificationService.DeleteNotificationsAsync(GetUserId(), request.NotificationIds);
            return Ok(new { count });
        }
    }
}
