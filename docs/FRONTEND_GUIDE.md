# Frontend Guide

Mục đích: Hướng dẫn khởi tạo giao diện cho AI E-Learning & Teacher Booking Platform.

## 1. Tech Stack

- **Framework**: Vue 3 (Composition API preferred)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router 4
- **HTTP Client**: Axios with interceptors
- **Form Validation**: VeeValidate 4 + Yup
- **UI Framework**: Bootstrap 5 (utilities) + TailwindCSS + SCSS (custom components)
- **Icons**: Bootstrap Icons (1.11.0+)
- **Image Upload**: Cloudinary (widget + SDK)
- **Authentication**: Google OAuth (redirect to /api/auth/google)

## 2. UI Principles

- Role-first navigation: mỗi vai trò nhìn thấy đúng chức năng của mình
- Calendar-first booking: lịch học phải dễ đọc và thao tác nhanh
- Learning clarity: bài học, bài tập, deadline, và feedback phải nổi bật
- Trust and transparency: payment, review, and AI suggestions must be easy to verify

## 3. Suggested Page Map

- Public landing page
- Authentication pages
- Student dashboard
- Teacher dashboard
- Parent dashboard
- Admin dashboard
- Teacher search and detail pages
- Availability calendar and booking flow
- Course detail and enrollment pages
- Class management pages
- Assignment workspace and submission pages
- AI assistant panel
- Notification center

## 4. Component Structure

Use a layered component model:

- atoms: buttons, inputs, badges, tags
- molecules: search bar, booking card, rating card, schedule item
- organisms: calendar widget, teacher profile panel, assignment board, dashboard summary
- layouts: public layout, auth layout, student layout, teacher layout, admin layout

## 5. State Suggestions

- authStore: session, roles, permissions
- profileStore: teacher/student/parent information
- bookingStore: availability, selected slot, booking history
- courseStore: courses, classes, lessons, materials
- assignmentStore: tasks, submissions, grading status
- aiStore: recommendations, chat history, summaries
- notificationStore: reminders and unread counts

## 6. Folder Structure

```text
frontend/
src/
  components/
    shared/                  # ← Reusable across all views (SHARED LIBRARY)
      buttons/
        BaseButton.vue       # Primary, secondary, danger variants
        IconButton.vue
      forms/
        FormInput.vue
        FormSelect.vue
        FormCheckbox.vue
        FormTextarea.vue
      cards/
        BaseCard.vue
        TeacherCard.vue
        BookingCard.vue
      modals/
        BaseModal.vue
        ConfirmDialog.vue
      loaders/
        Spinner.vue
        Skeleton.vue
      pagination/
        Pagination.vue
      index.ts               # Barrel export: export * from ...
    layouts/
      AuthLayout.vue
      StudentLayout.vue
      TeacherLayout.vue
      AdminLayout.vue
    pages/
      auth/
        LoginPage.vue
        ProfileSetupPage.vue
      student/
        DashboardPage.vue
        BookingsPage.vue
        CoursesPage.vue
        AssignmentsPage.vue
      teacher/
        DashboardPage.vue
        AvailabilityPage.vue
        ClassesPage.vue
  router/
    index.ts
    routes.ts
  stores/                    # ← Pinia stores (shared state)
    modules/
      auth.ts
      profile.ts
      booking.ts
      course.ts
      assignment.ts
      ai.ts
      notification.ts
  composables/               # ← Reusable logic
    useAuth.ts
    useBooking.ts
    useAPI.ts
    useForm.ts
    useValidation.ts
    usePagination.ts
  services/                  # ← API & external services
    api.ts                   # Axios instance with interceptors
    authService.ts
    bookingService.ts
    courseService.ts
    cloudinaryService.ts
  styles/
    variables.scss           # Colors, spacing, breakpoints, z-index
    shared-components.scss   # ← CUSTOM CSS CLASSES (reusable)
    utilities.scss           # Helper classes (.text-center-custom, etc)
    global.scss
  types/
    auth.ts
    booking.ts
    course.ts
    common.ts
  assets/
    images/
    icons/
  App.vue
  main.ts

public/
  index.html
vite.config.ts
tsconfig.json
```

### Key Principles: Avoid Duplication

- **Shared Components**: All reusable UI elements in `src/components/shared/` with barrel export
- **Custom CSS Classes**: Defined in `styles/shared-components.scss`, used across multiple components
- **Stores**: Single source of truth for app state (auth, profile, booking)
- **Composables**: Extract shared logic into composables, not duplicate in components
- **Services**: Centralize API calls in services, consumed by stores/composables

## 7. Accessibility and UX Notes

- Make forms validation visible and understandable.
- Keep booking time slots and deadlines readable on mobile.
- Use empty states for no bookings, no assignments, and no notifications.
- Ensure AI actions are clearly labeled as suggestions or drafts.

## 8. Notes

Wireframes and design tokens should be added before implementation begins.
