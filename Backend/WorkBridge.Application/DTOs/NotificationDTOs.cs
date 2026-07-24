using System;
using System.Collections.Generic;

namespace WorkBridge.Application.DTOs
{
    public class NotificationResponse
    {
        public int NotificationId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public bool IsArchived { get; set; }
        public string Category { get; set; } = "General";
        public string? ActionUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class NotificationPageResponse
    {
        public List<NotificationResponse> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public int UnreadCount { get; set; }
        public Dictionary<string, int> CategoryCounts { get; set; } = new();
    }

    public class NotificationBulkRequest
    {
        public List<int> NotificationIds { get; set; } = new();
    }
}
