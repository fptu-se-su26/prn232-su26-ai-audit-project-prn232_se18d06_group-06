# Backend Shared Library & Architecture (.NET 8)

Mục đích: Ghi lại các shared services, utilities, base classes, constants, exceptions được sử dụng trên toàn bộ backend .NET 8 Web API.

**Nguyên tắc**: Mỗi utility/service được tạo **một lần** trong `AIELearning.Shared`, sử dụng **nhiều nơi** → tránh duplicate code.

---

## 1. Project Organization

```
AIELearning/
  AIELearning.API/                # ASP.NET Core Web API (Controllers, Middleware)
  AIELearning.Application/        # Business logic (Services, DTOs, Validators)
  AIELearning.Domain/             # DDD entities, aggregates, interfaces
  AIELearning.Persistence/        # EF Core, repositories, database contexts
  AIELearning.Infrastructure/     # External services (Cloudinary, Email, etc.)
  AIELearning.Shared/             # ← SHARED CODE (one place, many uses)
  AIELearning.Tests/              # Unit & integration tests
```

---

## 2. Shared Code Organization (`AIELearning.Shared/`)

```
AIELearning.Shared/
  Bases/
    BaseEntity.cs
    BaseService.cs
    BaseRepository.cs
  Constants/
    ValidationMessages.cs
    ErrorCodes.cs
    UserRoles.cs
    BookingStatuses.cs
  Enums/
    UserRole.cs
    BookingStatus.cs
    SubmissionStatus.cs
    NotificationType.cs
  Extensions/
    StringExtensions.cs
    DateTimeExtensions.cs
    CollectionExtensions.cs
  Utilities/
    PaginationHelper.cs
    CloudinaryHelper.cs
    EncryptionHelper.cs
    JwtTokenGenerator.cs
  DTOs/
    PaginatedResponse.cs
    ApiResponse.cs
  Exceptions/
    AppException.cs
    ValidationException.cs
    NotFoundException.cs
```

---

## 3. Base Classes

### BaseEntity.cs
```csharp
namespace AIELearning.Shared.Bases;

public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; }
    public string UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
```

**Usage**:
```csharp
// Domain/Entities/Booking.cs
public class Booking : BaseEntity
{
    public int StudentId { get; set; }
    public int TeacherId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Status { get; set; } // Pending, Confirmed, Completed, Cancelled
    public string Location { get; set; } // Online, AtHome, Offline
}

public class Course : BaseEntity
{
    public string Title { get; set; }
    public string Description { get; set; }
    public int TeacherId { get; set; }
    public decimal Price { get; set; }
}
```

### BaseService.cs
```csharp
namespace AIELearning.Shared.Bases;

public abstract class BaseService
{
    protected readonly ILogger<BaseService> _logger;
    protected readonly IMapper _mapper;
    
    protected BaseService(ILogger<BaseService> logger, IMapper mapper)
    {
        _logger = logger;
        _mapper = mapper;
    }
    
    protected void LogInfo(string message, params object[] args) => 
        _logger.LogInformation(message, args);
    
    protected void LogError(Exception ex, string message, params object[] args) =>
        _logger.LogError(ex, message, args);
    
    protected async Task<T> ExecuteWithErrorHandling<T>(
        Func<Task<T>> operation,
        string operationName)
    {
        try
        {
            return await operation();
        }
        catch (Exception ex)
        {
            LogError(ex, $"Error executing {operationName}");
            throw;
        }
    }
}
```

**Usage**:
```csharp
// Application/Services/BookingService.cs
public class BookingService : BaseService, IBookingService
{
    private readonly IBookingRepository _repo;
    
    public BookingService(
        ILogger<BookingService> logger,
        IMapper mapper,
        IBookingRepository repo)
        : base(logger, mapper)
    {
        _repo = repo;
    }
    
    public async Task<BookingDTO> CreateBooking(CreateBookingCommand cmd)
    {
        return await ExecuteWithErrorHandling(
            async () =>
            {
                var booking = _mapper.Map<Booking>(cmd);
                booking.CreatedBy = cmd.CreatedBy;
                
                await _repo.AddAsync(booking);
                await _repo.SaveChangesAsync();
                
                LogInfo($"Booking {booking.Id} created by {cmd.CreatedBy}");
                
                return _mapper.Map<BookingDTO>(booking);
            },
            nameof(CreateBooking)
        );
    }
}
```

### BaseRepository.cs
```csharp
namespace AIELearning.Shared.Bases;

public abstract class BaseRepository<TEntity, TId> : IAsyncRepository<TEntity, TId>
    where TEntity : BaseEntity
{
    protected readonly ApplicationDbContext _context;
    
    protected BaseRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
        => await _context.Set<TEntity>()
            .Where(e => !e.IsDeleted)
            .ToListAsync();
    
    public virtual async Task<TEntity> GetByIdAsync(TId id)
        => await _context.Set<TEntity>()
            .FirstOrDefaultAsync(e => e.Id.Equals(id) && !e.IsDeleted);
    
    public virtual async Task AddAsync(TEntity entity)
    {
        await _context.Set<TEntity>().AddAsync(entity);
    }
    
    public virtual void Update(TEntity entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Set<TEntity>().Update(entity);
    }
    
    public virtual void Delete(TEntity entity)
    {
        entity.IsDeleted = true;
        _context.Set<TEntity>().Update(entity);
    }
    
    public virtual async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
```

---

## 4. Constants

### UserRoles.cs
```csharp
namespace AIELearning.Shared.Constants;

public static class UserRoles
{
    public const string Admin = nameof(Admin);
    public const string Teacher = nameof(Teacher);
    public const string Student = nameof(Student);
    public const string Parent = nameof(Parent);
    public const string Center = nameof(Center);
    
    public static readonly string[] AllRoles = 
    { 
        Admin, Teacher, Student, Parent, Center 
    };
    
    public static bool IsValidRole(string role) => AllRoles.Contains(role);
}
```

**Usage**:
```csharp
[Authorize(Roles = UserRoles.Teacher)]
public IActionResult GetTeacherDashboard() { ... }

if (!UserRoles.IsValidRole(userRole))
    throw new ValidationException("Invalid user role");
```

### BookingStatuses.cs
```csharp
namespace AIELearning.Shared.Constants;

public static class BookingStatuses
{
    public const string Pending = nameof(Pending);
    public const string Confirmed = nameof(Confirmed);
    public const string Completed = nameof(Completed);
    public const string Cancelled = nameof(Cancelled);
    public const string NoShow = nameof(NoShow);
}
```

### ValidationMessages.cs
```csharp
namespace AIELearning.Shared.Constants;

public static class ValidationMessages
{
    public const string EmailIsRequired = "Email là bắt buộc";
    public const string EmailIsInvalid = "Email không hợp lệ";
    public const string PasswordIsRequired = "Mật khẩu là bắt buộc";
    public const string PasswordIsTooShort = "Mật khẩu phải có ít nhất 8 ký tự";
    public const string NameIsRequired = "Tên là bắt buộc";
    public const string DuplicateEmail = "Email này đã tồn tại";
    public const string UserNotFound = "Người dùng không tồn tại";
    public const string InvalidCredentials = "Email hoặc mật khẩu không chính xác";
}
```

---

## 5. Extensions

### StringExtensions.cs
```csharp
namespace AIELearning.Shared.Extensions;

public static class StringExtensions
{
    public static bool IsValidEmail(this string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
    
    public static string Slugify(this string text)
    {
        var bytes = System.Text.Encoding.GetEncoding("Cyrillic")
            .GetBytes(text);
        return System.Text.Encoding.ASCII.GetString(bytes)
            .ToLower()
            .Replace(" ", "-")
            .Replace("--", "-")
            .Trim('-');
    }
    
    public static string Truncate(this string text, int maxLength)
    {
        if (string.IsNullOrEmpty(text)) return text;
        return text.Length <= maxLength ? text : text[..maxLength] + "...";
    }
    
    public static bool ContainsIgnoreCase(this string text, string value) =>
        text?.IndexOf(value, StringComparison.OrdinalIgnoreCase) >= 0;
}
```

**Usage**:
```csharp
if (!email.IsValidEmail())
    throw new ValidationException(ValidationMessages.EmailIsInvalid);

string slug = "Toán Học".Slugify(); // → "toan-hoc"
```

### DateTimeExtensions.cs
```csharp
namespace AIELearning.Shared.Extensions;

public static class DateTimeExtensions
{
    public static bool IsInPast(this DateTime dateTime) =>
        dateTime < DateTime.UtcNow;
    
    public static bool IsInFuture(this DateTime dateTime) =>
        dateTime > DateTime.UtcNow;
    
    public static int GetAgeInYears(this DateTime birthDate)
    {
        var today = DateTime.Today;
        var age = today.Year - birthDate.Year;
        if (birthDate.Date > today.AddYears(-age)) age--;
        return age;
    }
    
    public static string ToFriendlyString(this DateTime dateTime) =>
        dateTime.ToString("dd/MM/yyyy HH:mm");
    
    public static IEnumerable<DateTime> GetWeekDays(this DateTime dateTime)
    {
        var start = dateTime.AddDays(-(int)dateTime.DayOfWeek);
        for (int i = 0; i < 7; i++)
            yield return start.AddDays(i);
    }
}
```

### CollectionExtensions.cs
```csharp
namespace AIELearning.Shared.Extensions;

public static class CollectionExtensions
{
    public static bool IsNullOrEmpty<T>(this IEnumerable<T> collection) =>
        collection?.Any() != true;
    
    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T> collection) =>
        collection.Where(x => x != null);
    
    public static Dictionary<K, V> ToDictionaryIgnoreDuplicates<T, K, V>(
        this IEnumerable<T> collection,
        Func<T, K> keySelector,
        Func<T, V> valueSelector)
    {
        var dict = new Dictionary<K, V>();
        foreach (var item in collection)
        {
            var key = keySelector(item);
            if (!dict.ContainsKey(key))
                dict.Add(key, valueSelector(item));
        }
        return dict;
    }
}
```

---

## 6. Utilities

### PaginationHelper.cs
```csharp
namespace AIELearning.Shared.Utilities;

public class PaginationHelper
{
    public static IQueryable<T> ApplyPagination<T>(
        IQueryable<T> query,
        int page,
        int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100; // max 100
        
        return query
            .Skip((page - 1) * pageSize)
            .Take(pageSize);
    }
    
    public static PaginatedResponse<T> CreateResponse<T>(
        IEnumerable<T> items,
        int total,
        int page,
        int pageSize)
    {
        return new PaginatedResponse<T>
        {
            Items = items.ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }
}
```

**Usage**:
```csharp
public class BookingService : BaseService, IBookingService
{
    public async Task<PaginatedResponse<BookingDTO>> GetBookings(int page, int pageSize)
    {
        var query = _context.Bookings.Where(b => !b.IsDeleted);
        var total = await query.CountAsync();
        
        var items = await PaginationHelper
            .ApplyPagination(query, page, pageSize)
            .Select(b => _mapper.Map<BookingDTO>(b))
            .ToListAsync();
        
        return PaginationHelper.CreateResponse(items, total, page, pageSize);
    }
}
```

### CloudinaryHelper.cs
```csharp
namespace AIELearning.Shared.Utilities;

public static class CloudinaryHelper
{
    private static readonly Cloudinary _cloudinary;
    
    static CloudinaryHelper()
    {
        var account = new Account(
            Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME"),
            Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY"),
            Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
        );
        _cloudinary = new Cloudinary(account);
    }
    
    public static async Task<string> UploadImageAsync(
        IFormFile file,
        string folder = "elearning")
    {
        using (var stream = file.OpenReadStream())
        {
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                ResourceType = "auto"
            };
            
            var result = await _cloudinary.UploadAsync(uploadParams);
            return result.SecureUrl.ToString();
        }
    }
    
    public static async Task<bool> DeleteImageAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }
}
```

### EncryptionHelper.cs
```csharp
namespace AIELearning.Shared.Utilities;

public static class EncryptionHelper
{
    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
    
    public static bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
```

---

## 7. DTOs

### PaginatedResponse.cs
```csharp
namespace AIELearning.Shared.DTOs;

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; }
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
```

### ApiResponse.cs
```csharp
namespace AIELearning.Shared.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    
    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Message = message, Data = data };
    
    public static ApiResponse<T> Error(string message) =>
        new() { Success = false, Message = message };
}
```

---

## 8. Exceptions

### AppException.cs
```csharp
namespace AIELearning.Shared.Exceptions;

public class AppException : Exception
{
    public string Code { get; set; }
    public int StatusCode { get; set; }
    
    public AppException(string message, string code = "ERROR", int statusCode = 400)
        : base(message)
    {
        Code = code;
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) 
        : base(message, "NOT_FOUND", 404) { }
}

public class ValidationException : AppException
{
    public ValidationException(string message) 
        : base(message, "VALIDATION_ERROR", 422) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Unauthorized") 
        : base(message, "UNAUTHORIZED", 401) { }
}
```

**Usage**:
```csharp
public async Task<BookingDTO> GetBooking(int id)
{
    var booking = await _repo.GetByIdAsync(id);
    if (booking == null)
        throw new NotFoundException("Booking not found");
    
    return _mapper.Map<BookingDTO>(booking);
}
```

---

## 9. Middleware

### GlobalExceptionHandlingMiddleware.cs
```csharp
namespace AIELearning.API.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    
    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new ApiResponse<object>();
        
        if (exception is AppException appEx)
        {
            context.Response.StatusCode = appEx.StatusCode;
            response = ApiResponse<object>.Error(appEx.Message);
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            response = ApiResponse<object>.Error("Internal server error");
        }
        
        return context.Response.WriteAsJsonAsync(response);
    }
}
```

**Usage in Program.cs**:
```csharp
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
```

---

## 10. Dependency Injection Setup

### Program.cs
```csharp
var builder = WebApplicationBuilder.CreateBuilder(args);

// ← Add all shared services here
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseService, CourseService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Cloudinary
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("Cloudinary"));

var app = builder.Build();

// ← Register middleware
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

app.MapControllers();
app.Run();
```

---

## 11. Checklist: Avoid Duplication

- [ ] **New entity**? → Inherit from `BaseEntity`
- [ ] **New service**? → Inherit from `BaseService`
- [ ] **New repository**? → Inherit from `BaseRepository<T>`
- [ ] **String validation**? → Use `StringExtensions`
- [ ] **Date manipulation**? → Use `DateTimeExtensions`
- [ ] **Pagination**? → Use `PaginationHelper`
- [ ] **Image upload**? → Use `CloudinaryHelper`
- [ ] **Password hashing**? → Use `EncryptionHelper`
- [ ] **Exception handling**? → Use `AppException`, `NotFoundException`, etc.
- [ ] **New constant**? → Add to `AIELearning.Shared/Constants/`

---

## 12. Example: Complete Feature (Create Booking)

```csharp
// Domain/Entities/Booking.cs
public class Booking : BaseEntity
{
    public int StudentId { get; set; }
    public int TeacherId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Status { get; set; }
    public string Location { get; set; }
}

// Application/DTOs/CreateBookingCommand.cs
public class CreateBookingCommand
{
    public int StudentId { get; set; }
    public int TeacherId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Location { get; set; }
}

// Application/Validators/CreateBookingValidator.cs
public class CreateBookingValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingValidator()
    {
        RuleFor(x => x.ScheduledAt)
            .Must(dt => dt.IsInFuture())
            .WithMessage("Booking must be in the future");
        
        RuleFor(x => x.Location)
            .NotEmpty()
            .WithMessage(ValidationMessages.LocationIsRequired);
    }
}

// Application/Services/BookingService.cs
public class BookingService : BaseService, IBookingService
{
    private readonly IBookingRepository _repository;
    
    public BookingService(
        ILogger<BookingService> logger,
        IMapper mapper,
        IBookingRepository repository)
        : base(logger, mapper)
    {
        _repository = repository;
    }
    
    public async Task<BookingDTO> CreateBookingAsync(
        CreateBookingCommand command,
        string userId)
    {
        return await ExecuteWithErrorHandling(
            async () =>
            {
                // Validate
                if (command.ScheduledAt.IsInPast())
                    throw new ValidationException("Booking must be in the future");
                
                // Create entity
                var booking = _mapper.Map<Booking>(command);
                booking.Status = BookingStatuses.Pending;
                booking.CreatedBy = userId;
                
                // Persist
                await _repository.AddAsync(booking);
                await _repository.SaveChangesAsync();
                
                LogInfo($"Booking {booking.Id} created by {userId}");
                
                return _mapper.Map<BookingDTO>(booking);
            },
            nameof(CreateBookingAsync)
        );
    }
}

// API/Controllers/BookingsController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _service;
    
    public BookingsController(IBookingService service)
    {
        _service = service;
    }
    
    [HttpPost]
    public async Task<ActionResult<BookingDTO>> Create([FromBody] CreateBookingCommand command)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var booking = await _service.CreateBookingAsync(command, userId);
            return CreatedAtAction(nameof(Get), new { id = booking.Id }, booking);
        }
        catch (ValidationException ex)
        {
            return BadRequest(ApiResponse<object>.Error(ex.Message));
        }
    }
}
```

---

## 13. Notes

- Mỗi utility/service được tạo **một lần** trong `AIELearning.Shared`
- Không copy-paste logic, luôn sử dụng shared code
- Khi thêm feature mới, kiểm tra xem base class/helper đã tồn tại chưa
- Cập nhật docs này mỗi khi thêm shared component/utility mới
- Sử dụng dependency injection để inject shared services
- Tuân theo SOLID principles, đặc biệt Single Responsibility
