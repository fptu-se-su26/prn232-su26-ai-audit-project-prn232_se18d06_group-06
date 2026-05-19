# Backend API Reference (Draft)

Mục đích: Ghi lại các nhóm endpoint dự kiến cho AI E-Learning & Teacher Booking Platform.

## 1. Auth and Account (Google OAuth)

- GET /api/auth/google
  - Redirects to Google login
- GET /api/auth/google/callback
  - Google callback endpoint
  - Query: `code`, `state`
  - Response: Redirect to frontend with session token or first-time setup page
- POST /api/auth/complete-profile (First-time users only)
  - Body: { role: "teacher|student|parent|center", fullName, additionalFields }
  - Response: { token, user }
- GET /api/auth/me
  - Returns current user profile
- POST /api/auth/logout
  - Clears session

## 2. User and Profile

- GET /api/users/{id}
- PATCH /api/users/{id}
- GET /api/teachers
- GET /api/teachers/{id}
- POST /api/teachers/{id}/subjects
- PATCH /api/teachers/{id}/availability

## 3. Search and Booking

- GET /api/teachers/search
- GET /api/teachers/{id}/availability
- POST /api/bookings
- GET /api/bookings
- GET /api/bookings/{id}
- POST /api/bookings/{id}/confirm
- POST /api/bookings/{id}/cancel

## 4. Courses, Classes, and Content

- POST /api/courses
- GET /api/courses
- GET /api/courses/{id}
- PATCH /api/courses/{id}
- POST /api/classes
- GET /api/classes/{id}
- POST /api/classes/{id}/enrollments
- POST /api/lessons
- POST /api/materials

## 5. Assignments and Assessment

- POST /api/assignments
- GET /api/assignments/{id}
- PATCH /api/assignments/{id}
- POST /api/assignments/{id}/publish
- POST /api/submissions
- GET /api/submissions/{id}
- PATCH /api/submissions/{id}/grade
- POST /api/submissions/{id}/feedback

## 6. Payments and Revenue

- POST /api/payments/checkout
- POST /api/payments/webhook
- GET /api/payments/history
- GET /api/revenue/summary

## 7. Reviews and Notifications

- POST /api/reviews
- GET /api/reviews
- GET /api/notifications
- PATCH /api/notifications/{id}/read

## 8. AI Services

- POST /api/ai/teacher-recommendations
- POST /api/ai/questions/answer
- POST /api/ai/assignments/generate
- POST /api/ai/assignments/{id}/feedback-draft
- POST /api/ai/lessons/summarize

## 9. Dashboards

- GET /api/dashboards/teacher
- GET /api/dashboards/student
- GET /api/dashboards/parent
- GET /api/dashboards/admin

## 10. Common Response Notes

- Use consistent pagination metadata for list endpoints.
- Return role-aware payloads where needed.
- Keep AI-generated outputs separate from final teacher decisions.
- Include audit metadata for booking, payment, grading, and AI features.

## 11. Expected Status Codes

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity
- 500 Internal Server Error

Ghi chú: Endpoint chi tiết, request body và response schema sẽ được chốt khi stack backend được chọn.
