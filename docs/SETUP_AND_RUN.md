# Setup And Run

Mục đích: Ghi lại cách cài đặt và chạy project khi implementation bắt đầu.

## Current Status

Hiện tại repository mới ở giai đoạn tài liệu, chưa có source code runnable.

## Tech Stack

### Backend
- **Runtime**: .NET 8 ASP.NET Core Web API
- **Database**: MSSQL (primary), MongoDB (for flexible documents)
- **ORM**: Entity Framework Core
- **Authentication**: Google OAuth 2.0
- **Image Storage**: Cloudinary
- **Dependencies**: AutoMapper, FluentValidation, Serilog

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router 4
- **Styling**: Bootstrap 5 + TailwindCSS + SCSS (for custom)
- **Form Validation**: VeeValidate + Yup
- **HTTP Client**: Axios
- **Icon Library**: Bootstrap Icons

## Prerequisites

- ✅ .NET 8 SDK
- ✅ Node.js 18+
- ✅ MSSQL Server 2019+
- ✅ MongoDB 5.0+
- ✅ Cloudinary account
- ✅ Google OAuth credentials
- ✅ Email service API key
- ✅ Payment gateway API (Stripe/PayPal)

## Backend Setup (.NET 8)

### Install & Run

```bash
cd backend/
# Restore dependencies
dotnet restore

# Apply MSSQL migrations
dotnet ef database update

# Build
dotnet build

# Development (watch mode)
dotnet watch run --launch-profile Development

# Run tests
dotnet test
```

### Swagger UI available at

```
https://localhost:5001/swagger
```

## Frontend Setup (Vue 3 + Vite)

### Install & Run

```bash
cd frontend/
# Install dependencies
npm install

# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format
npm run lint
npm run format
```

### Dev server runs at

```
http://localhost:5173
```

## Database Setup

### MSSQL Server

```bash
# Docker run:
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
  -p 1433:1433 -d --name mssql \
  mcr.microsoft.com/mssql/server:2022-latest
```

### MongoDB

```bash
# Docker run:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Environment Configuration

### Backend (appsettings.Development.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AIELearning;User Id=sa;Password=YourPassword123!;Encrypt=false;",
    "MongoDb": "mongodb://localhost:27017/AIELearning"
  },
  "Authentication": {
    "GoogleClientId": "your-google-client-id",
    "GoogleClientSecret": "your-google-client-secret",
    "JwtSecret": "your-jwt-secret-min-32-chars"
  },
  "Cloudinary": {
    "CloudName": "your-cloudinary-name",
    "ApiKey": "your-cloudinary-key",
    "ApiSecret": "your-cloudinary-secret"
  },
  "Email": {
    "ApiKey": "your-email-service-key"
  },
  "Payment": {
    "StripePublishableKey": "pk_test_...",
    "StripeSecretKey": "sk_test_..."
  }
}
```

### Frontend (.env.development)

```bash
VITE_API_BASE_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Docker Compose Setup (Optional)

```yaml
version: '3.8'
services:
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: Y
      SA_PASSWORD: YourPassword123!
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mssql_data:
  mongo_data:
```

## Full Stack Startup

1. **Start databases**:
   ```bash
   docker-compose up -d
   ```

2. **Start backend** (new terminal):
   ```bash
   cd backend && dotnet watch run
   ```

3. **Start frontend** (new terminal):
   ```bash
   cd frontend && npm run dev
   ```

4. **Verify setup**:
   - [ ] Backend Swagger: http://localhost:5001/swagger
   - [ ] Frontend: http://localhost:5173
   - [ ] Google OAuth login flow
   - [ ] First-time profile setup
   - [ ] MSSQL connection via Entity Framework
   - [ ] MongoDB connection for documents
   - [ ] Cloudinary image upload
   - [ ] Teacher booking flow
   - [ ] Assignment submission

## Checklist for the First Run

- [ ] Environment variables configured
- [ ] Database connected
- [ ] Auth flow works
- [ ] Booking flow works
- [ ] Assignment flow works
- [ ] AI endpoints return expected responses

## Notes

Avoid hard-coding platform credentials in the repository. Store secrets in `.env` or a secret manager.
