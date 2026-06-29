using WorkBridge.Application.DTOs;

namespace WorkBridge.Application.Interfaces
{
    /// <summary>
    /// Abstraction for pushing real-time events to connected clients via SignalR.
    /// Decouples Application layer from the API (Hub) layer.
    /// </summary>
    public interface IHubNotifier
    {
        
        Task NotifyConversationUpdatedAsync(int userId1, int userId2);

        

        // ── Workforce (shifts, attendance, payroll, shift-pass) ──────────────
        Task NotifyWorkforceChangedAsync(int employerId, int employeeUserId);
    }
}
