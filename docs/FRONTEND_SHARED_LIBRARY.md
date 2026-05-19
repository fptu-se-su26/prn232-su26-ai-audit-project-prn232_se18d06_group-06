# Frontend Shared Component Library

Mục đích: Ghi lại các Vue 3 component tái sử dụng, custom CSS classes và composables được chia sẻ trên toàn bộ ứng dụng.

**Nguyên tắc**: Mỗi component được tạo **một lần**, sử dụng **nhiều nơi** → tránh duplicate code.

---

## 1. Shared Components (`src/components/shared/`)

Tất cả components dưới `shared/` phải được export từ `src/components/shared/index.ts`:

```typescript
// src/components/shared/index.ts
export { default as BaseButton } from './buttons/BaseButton.vue'
export { default as IconButton } from './buttons/IconButton.vue'
export { default as FormInput } from './forms/FormInput.vue'
export { default as FormSelect } from './forms/FormSelect.vue'
export { default as FormCheckbox } from './forms/FormCheckbox.vue'
export { default as BaseCard } from './cards/BaseCard.vue'
export { default as TeacherCard } from './cards/TeacherCard.vue'
export { default as BookingCard } from './cards/BookingCard.vue'
export { default as BaseModal } from './modals/BaseModal.vue'
export { default as ConfirmDialog } from './modals/ConfirmDialog.vue'
export { default as Spinner } from './loaders/Spinner.vue'
export { default as Pagination } from './pagination/Pagination.vue'
```

### 1.1 Button Components

#### BaseButton.vue
- **Props**: `type` (primary|secondary|danger), `size` (sm|md|lg), `disabled`, `loading`
- **Slot**: default (button text)
- **Usage**:
```vue
<BaseButton type="primary" size="md" @click="handleSubmit">
  Lưu
</BaseButton>
```
- **CSS**: Use Tailwind + Bootstrap utilities
- **CSS Classes Used**: `btn`, `btn-primary`, `btn-secondary`, `btn-danger`

#### IconButton.vue
- **Props**: `icon` (Bootstrap Icons class), `variant` (outline|solid), `size` (sm|md)
- **Usage**:
```vue
<IconButton icon="bi-pencil-square" variant="outline" />
```

### 1.2 Form Components

#### FormInput.vue
- **Props**: `v-model`, `label`, `type` (text|email|number), `placeholder`, `disabled`, `error`
- **Features**: Validation error display, Bootstrap + Tailwind styling
- **Usage**:
```vue
<FormInput 
  v-model="form.email"
  label="Email"
  type="email"
  placeholder="user@example.com"
  :error="errors.email"
/>
```

#### FormSelect.vue
- **Props**: `v-model`, `label`, `options` (Array<{value, label}>), `disabled`, `error`
- **Usage**:
```vue
<FormSelect 
  v-model="form.role"
  label="Vai trò"
  :options="[
    { value: 'teacher', label: 'Giáo viên' },
    { value: 'student', label: 'Học sinh' }
  ]"
/>
```

#### FormCheckbox.vue
- **Props**: `v-model`, `label`, `disabled`
- **Usage**:
```vue
<FormCheckbox v-model="agreeTerms" label="Tôi đồng ý với điều khoản" />
```

#### FormTextarea.vue
- **Props**: `v-model`, `label`, `placeholder`, `rows`, `error`

### 1.3 Card Components

#### BaseCard.vue
- **Props**: `title`, `class` (custom classes)
- **Slot**: default (card content)
- **Usage**:
```vue
<BaseCard title="Thông tin cơ bản">
  <p>Nội dung card</p>
</BaseCard>
```
- **CSS**: Bootstrap `card`, Tailwind `rounded`, `shadow`

#### TeacherCard.vue
- **Props**: `teacher` (TeacherProfile), `clickable`
- **Features**: Display teacher avatar, name, rating, subjects, price
- **Slot**: optional footer actions
- **Usage**:
```vue
<TeacherCard :teacher="selectedTeacher" @click="viewDetails" />
```

#### BookingCard.vue
- **Props**: `booking` (Booking), `status`
- **Features**: Timeline display, action buttons (Confirm, Cancel, Reschedule)
- **Usage**:
```vue
<BookingCard :booking="booking" status="pending" />
```

### 1.4 Modal Components

#### BaseModal.vue
- **Props**: `modelValue` (show|hide), `title`, `size` (sm|md|lg)
- **Slot**: `default` (body), `header`, `footer`
- **Events**: `@update:modelValue`
- **Usage**:
```vue
<BaseModal v-model="showModal" title="Xác nhận">
  <p>Bạn có chắc muốn xóa không?</p>
  <template #footer>
    <BaseButton @click="showModal = false">Hủy</BaseButton>
    <BaseButton type="danger" @click="confirm">Xóa</BaseButton>
  </template>
</BaseModal>
```

#### ConfirmDialog.vue
- **Props**: `modelValue`, `title`, `message`, `confirmText`, `cancelText`
- **Events**: `@confirm`, `@cancel`
- **Usage**:
```vue
<ConfirmDialog 
  v-model="showConfirm"
  title="Xóa bài tập"
  message="Hành động này không thể hoàn tác"
  @confirm="deleteAssignment"
/>
```

### 1.5 Loader Components

#### Spinner.vue
- **Props**: `size` (sm|md|lg), `color` (primary|secondary)
- **Usage**:
```vue
<Spinner size="md" color="primary" />
```

#### Skeleton.vue
- **Props**: `type` (line|card|table), `count` (for multiple lines)
- **Usage**: Display while loading data

### 1.6 Pagination.vue
- **Props**: `modelValue` (current page), `total`, `perPage`, `maxPages`
- **Events**: `@update:modelValue`
- **Usage**:
```vue
<Pagination 
  :model-value="currentPage" 
  :total="totalItems"
  :per-page="10"
  @update:model-value="currentPage = $event"
/>
```

---

## 2. Custom CSS Classes (`src/styles/shared-components.scss`)

Định nghĩa một lần, sử dụng khắp nơi:

```scss
// src/styles/shared-components.scss

// Custom text utilities
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-center-custom {
  text-align: center;
  padding: 1rem;
}

// Custom card utilities
.card-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-hover {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// Custom badge utilities
.badge-primary-light {
  background-color: #e3f2fd;
  color: #1976d2;
}

.badge-success-light {
  background-color: #e8f5e9;
  color: #388e3c;
}

// Custom spacing utilities
.space-y-4 {
  > * + * {
    margin-top: 1rem;
  }
}

// Custom button states
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

// Custom form utilities
.form-group-custom {
  margin-bottom: 1.5rem;
  
  label {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  input, select, textarea {
    width: 100%;
  }
}

// Loading state
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
}

// Custom table utilities
.table-custom {
  border-collapse: collapse;
  width: 100%;
  
  th {
    background-color: #f5f5f5;
    font-weight: 600;
    text-align: left;
    padding: 0.75rem;
    border-bottom: 2px solid #ddd;
  }
  
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #ddd;
  }
  
  tr:hover {
    background-color: #f9f9f9;
  }
}

// Responsive utilities
.hide-on-mobile {
  @media (max-width: 768px) {
    display: none;
  }
}

.hide-on-desktop {
  @media (min-width: 769px) {
    display: none;
  }
}

// Animation utilities
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}
```

### Usage Example
```vue
<div class="card card-shadow card-hover">
  <h3>{{ title }}</h3>
  <p class="text-truncate-2">{{ description }}</p>
  <button class="btn btn-primary">Chi tiết</button>
</div>
```

---

## 3. Shared Composables (`src/composables/`)

Reusable logic bộ nhớ:

### useAuth.ts
```typescript
export const useAuth = () => {
  const authStore = useAuthStore()
  
  const isLoggedIn = computed(() => !!authStore.token)
  const currentUser = computed(() => authStore.user)
  const userRole = computed(() => authStore.user?.role)
  
  const logout = async () => {
    await authStore.logout()
    await router.push('/login')
  }
  
  const hasRole = (role: string) => authStore.user?.role === role
  
  const hasPermission = (permission: string) => {
    // Check permission based on role
  }
  
  return {
    isLoggedIn,
    currentUser,
    userRole,
    logout,
    hasRole,
    hasPermission
  }
}
```

### useAPI.ts
```typescript
export const useAPI = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const request = async (config: AxiosRequestConfig) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios(config)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return { loading, error, request }
}
```

### useForm.ts
```typescript
export const useForm = (initialValues: any) => {
  const form = reactive({ ...initialValues })
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  
  const resetForm = () => {
    Object.assign(form, initialValues)
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
  }
  
  const setFieldError = (field: string, message: string) => {
    errors[field] = message
  }
  
  const touchField = (field: string) => {
    touched[field] = true
  }
  
  return { form, errors, touched, resetForm, setFieldError, touchField }
}
```

### usePagination.ts
```typescript
export const usePagination = (items: Ref<any[]>, perPage: number = 10) => {
  const currentPage = ref(1)
  
  const totalPages = computed(() => Math.ceil(items.value.length / perPage))
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return items.value.slice(start, start + perPage)
  })
  
  const goToPage = (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }
  
  return { currentPage, totalPages, paginatedItems, goToPage }
}
```

---

## 4. Shared Services (`src/services/`)

### api.ts - Axios Instance
```typescript
import axios from 'axios'
import { useAuthStore } from '@/stores/modules/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// Request interceptor
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      useAuthStore().logout()
    }
    return Promise.reject(error)
  }
)

export default api
```

### bookingService.ts
```typescript
import api from './api'

export const bookingService = {
  search: (query: SearchQuery) => 
    api.get<Teacher[]>('/api/teachers/search', { params: query }),
  
  getAvailability: (teacherId: number) =>
    api.get<Slot[]>(`/api/teachers/${teacherId}/availability`),
  
  createBooking: (data: CreateBookingRequest) =>
    api.post<Booking>('/api/bookings', data),
  
  confirmBooking: (bookingId: number) =>
    api.post(`/api/bookings/${bookingId}/confirm`),
  
  cancelBooking: (bookingId: number) =>
    api.post(`/api/bookings/${bookingId}/cancel`)
}
```

---

## 5. Checklist: Avoid Duplication

- [ ] **New Button**? → Use BaseButton
- [ ] **New Form Input**? → Use FormInput
- [ ] **Copy-paste CSS**? → Add to `shared-components.scss`
- [ ] **Repeated Logic**? → Extract to composable
- [ ] **API Call**? → Use service in src/services/
- [ ] **State Used Twice+**? → Put in Pinia store

---

## 6. Example: Complete Feature (Teacher Search)

```vue
<!-- src/pages/student/TeacherSearchPage.vue -->
<template>
  <StudentLayout>
    <div class="space-y-4">
      <h1>Tìm kiếm giáo viên</h1>
      
      <!-- Search Form -->
      <BaseCard title="Bộ lọc">
        <form @submit.prevent="handleSearch" class="form-group-custom">
          <FormInput v-model="searchForm.subject" label="Môn học" />
          <FormSelect v-model="searchForm.priceRange" label="Mức giá" :options="priceOptions" />
          <BaseButton type="primary">Tìm kiếm</BaseButton>
        </form>
      </BaseCard>
      
      <!-- Loading State -->
      <Spinner v-if="loading" size="md" />
      
      <!-- Results -->
      <div v-else class="grid grid-cols-3 gap-4">
        <TeacherCard 
          v-for="teacher in teachers" 
          :key="teacher.id"
          :teacher="teacher"
          @click="selectTeacher(teacher)"
        />
      </div>
      
      <!-- Pagination -->
      <Pagination 
        :model-value="currentPage"
        :total="total"
        :per-page="12"
        @update:model-value="currentPage = $event"
      />
    </div>
  </StudentLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAPI } from '@/composables/useAPI'
import { useForm } from '@/composables/useForm'
import { bookingService } from '@/services/bookingService'
import { BaseCard, FormInput, FormSelect, BaseButton, Spinner, TeacherCard, Pagination } from '@/components/shared'

const { request, loading } = useAPI()
const { form: searchForm } = useForm({ subject: '', priceRange: 'all' })

const teachers = ref([])
const currentPage = ref(1)
const total = ref(0)

const handleSearch = async () => {
  try {
    const result = await bookingService.search({
      subject: searchForm.subject,
      priceRange: searchForm.priceRange,
      page: currentPage.value
    })
    teachers.value = result.data.items
    total.value = result.data.total
  } catch (err) {
    console.error(err)
  }
}

const selectTeacher = (teacher) => {
  // Navigate to booking
}
</script>

<style scoped lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
</style>
```

---

## 7. Notes

- Mỗi file component/utility chỉ định nghĩa **một lần**
- Không copy-paste, luôn import từ `shared/`
- Khi thêm feature mới, kiểm tra xem component/style/logic đã tồn tại chưa
- Cập nhật docs này mỗi khi thêm shared component mới
