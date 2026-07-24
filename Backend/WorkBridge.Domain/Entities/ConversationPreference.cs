namespace WorkBridge.Domain.Entities;

public class ConversationPreference
{
    public int ConversationPreferenceId { get; set; }
    public int UserId { get; set; }
    public int ContactId { get; set; }
    public bool IsPinned { get; set; }
    public bool IsArchived { get; set; }
    public bool IsMuted { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public virtual User User { get; set; } = null!;
    public virtual User Contact { get; set; } = null!;
}
