# Domain-Driven Design Overview (AI E-Learning & Teacher Booking Platform)

Tóm tắt kiến trúc DDD cho project AI E-Learning & Teacher Booking Platform.

## Bounded Contexts

- Identity & Access: authentication, authorization, role management
- Teacher Marketplace: teacher profile, subjects, pricing, ratings
- Scheduling & Booking: availability, booking requests, lesson sessions
- Learning Delivery: courses, classes, lessons, materials
- Assignment & Assessment: assignments, submissions, grading, feedback
- Payments & Revenue: checkout, invoices, payouts, transaction history
- Notifications: reminders, deadline alerts, booking updates
- AI Services: assignment generation, teacher recommendation, Q&A assistant, lesson summary
- Analytics & Reporting: progress tracking, revenue tracking, usage metrics

## Key Aggregates

- User aggregate: user account, role, profile extensions
- TeacherProfile aggregate: bio, subjects, rates, experience, availability links
- Booking aggregate: request, schedule, session format, location, status
- Course aggregate: course metadata, modules, lessons, enrollment rules
- Assignment aggregate: prompt, deadline, rubric, submissions, grades
- Payment aggregate: order, transaction, refund, revenue snapshot
- AIRequest aggregate: input context, generated output, audit metadata

## Core Entities

- User
- TeacherProfile
- StudentProfile
- ParentProfile
- CenterProfile
- AvailabilitySlot
- Booking
- Course
- ClassRoom
- Lesson
- Material
- Assignment
- Submission
- Grade
- Review
- Payment
- Notification
- AiRecommendation
- AiSummary

## Repository Layer

- UserRepository
- TeacherRepository
- BookingRepository
- CourseRepository
- ClassRepository
- AssignmentRepository
- SubmissionRepository
- PaymentRepository
- NotificationRepository
- AiAuditRepository

## Integration Notes

- REST API is the main integration channel between frontend and backend.
- AI capabilities should be wrapped behind a service layer so they can be enabled, disabled, or replaced.
- Notifications should be emitted from domain events where possible instead of direct UI coupling.
- Payments, booking confirmations, and grading updates should be observable through audit-friendly logs.

## Backend Architecture (.NET 8 ASP.NET Core)

### Layered Architecture

```
┌─────────────────────────────────────┐
│ API Layer (Controllers, Middleware)  │
├─────────────────────────────────────┤
│ Application Layer (Services, DTOs)   │
├─────────────────────────────────────┤
│ Domain Layer (Entities, Aggregates)  │
├─────────────────────────────────────┤
│ Persistence Layer (EF Core, Repos)   │
├─────────────────────────────────────┤
│ Infrastructure (Cloudinary, Email)   │
└─────────────────────────────────────┘
```

### Project Structure

```
AIELearning/
  AIELearning.API/
    Controllers/              # HTTP endpoints
    Middleware/              # Auth, logging, error handling
    Program.cs              # DI configuration

  AIELearning.Application/
    Services/               # ← Business logic (SHARED)
      AuthService.cs
      BookingService.cs
      CourseService.cs
      CloudinaryService.cs
      EmailService.cs
    DTOs/                   # ← Data transfer objects
      AuthDTO.cs
      BookingDTO.cs
    Validators/             # FluentValidation
    MappingProfiles/        # AutoMapper profiles
  
  AIELearning.Domain/
    Entities/
      User.cs               # Base entity
      TeacherProfile.cs
      Booking.cs
      Course.cs
      Assignment.cs
      Grade.cs
    Aggregates/             # DDD aggregates
    Repositories/           # Interface definitions
    ValueObjects/
    Events/                 # Domain events
  
  AIELearning.Persistence/
    Data/
      ApplicationDbContext.cs      # MSSQL
      MongoDbContext.cs           # MongoDB
    Repositories/                 # EF Core implementations
    Migrations/
  
  AIELearning.Infrastructure/
    Cloudinary/
    Email/
    Payment/
    AI/
  
  AIELearning.Shared/             # ← SHARED CODE
    Constants/
      ValidationMessages.cs
      ErrorCodes.cs
      UserRoles.cs
    Enums/
      BookingStatus.cs
      SubmissionStatus.cs
    Extensions/
      StringExtensions.cs
      DateTimeExtensions.cs
    Utilities/
      PaginationHelper.cs
      CloudinaryHelper.cs
      EncryptionHelper.cs
    BaseClasses/
      BaseEntity.cs         # CreatedAt, UpdatedAt, CreatedBy
      BaseService.cs
    Exceptions/
      AppException.cs
```

### Shared Code Pattern (Backend)

**Goal**: Avoid code duplication across bounded contexts

```csharp
// src/AIELearning.Shared/BaseClasses/BaseEntity.cs
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; }
    public bool IsDeleted { get; set; }
}

// Any entity:
public class Booking : BaseEntity { ... }
public class Course : BaseEntity { ... }

// src/AIELearning.Shared/Constants/UserRoles.cs
public static class UserRoles
{
    public const string Admin = "Admin";
    public const string Teacher = "Teacher";
    public const string Student = "Student";
    public const string Parent = "Parent";
    public const string Center = "Center";
}

// Usage in any service:
public class RoleService
{
    public bool IsTeacher(string role) => role == UserRoles.Teacher;
}

// src/AIELearning.Shared/Extensions/StringExtensions.cs
public static class StringExtensions
{
    public static bool IsValidEmail(this string email)
    {
        // Implementation
    }
    
    public static string Slugify(this string text)
    {
        // Implementation
    }
}
```

### Database Strategy

**MSSQL (Primary - Transactional Data)**:
- Tables: Users, TeacherProfiles, Bookings, Courses, Classes, Assignments, Submissions, Grades, Payments, Reviews
- Ensures ACID compliance, strong constraints, relational integrity

**MongoDB (Flexible - Document Data)**:
- Collections: LessonNotes, AIGeneratedContent, AnyticsSnapshots, ChatMessages
- Allows flexible schema, nested documents, easy scaling

### Service Layer Pattern

```csharp
// Interface in Domain
public interface IBookingService
{
    Task<BookingDTO> CreateBooking(CreateBookingCommand cmd);
    Task<BookingDTO> GetBooking(int id);
}

// Implementation in Application
public class BookingService : BaseService, IBookingService
{
    private readonly IBookingRepository _repo;
    private readonly ICloudinaryService _cloudinary;
    
    public async Task<BookingDTO> CreateBooking(CreateBookingCommand cmd)
    {
        // 1. Validate
        // 2. Map to entity
        // 3. Persist
        // 4. Emit event (for notifications, AI recommendations)
        // 5. Return DTO
    }
}

// Injected in controller
[ApiController, Route("api/[controller]")]
public class BookingsController
{
    private readonly IBookingService _service;
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingCommand cmd)
    {
        var result = await _service.CreateBooking(cmd);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }
}
```

### Notes

Chi tiết ERD, migration scripts, and integration tests will be added when implementation starts.
