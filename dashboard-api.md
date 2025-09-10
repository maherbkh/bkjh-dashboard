# Dashboard System API Documentation

## 👨‍💼 **Dashboard System Overview**

- **Domain**: `dashboard.backhaus.test/de`
- **Module**: `modules/dashboard`
- **Authentication**: **Admin Auth** (JWT + Guards)
- **Access Level**: Admin users only
- **Purpose**: Internal admin dashboard

---

## 🔐 **Security Configuration**

### **Authentication**
- ✅ **JWT Authentication** (Admin users)
- ✅ **Role-Based Access** (Admin guards)
- ✅ **Session Management** (Login/logout)
- ✅ **Token Refresh** (Automatic renewal)

### **CSRF Protection**
- ✅ **CSRF Token Generation** (for admin forms)
- ✅ **Isolated CSRF System** (separate from other subdomains)
- ✅ **Admin Form Protection**
- ✅ **Dashboard-specific Cookie** (`XSRF-TOKEN-DASHBOARD`)
- ✅ **Dashboard-specific Session** (`dashboardCsrfSecret`)
- ✅ **Dashboard-specific Headers** (`X-Dashboard-CSRF-Token`)

### **Rate Limiting**
- ✅ **Auth Rate Limiting** (login attempts)
- ✅ **API Rate Limiting** (admin operations)
- ✅ **Sensitive Operation Limits** (password changes)

---

## 🌐 **Base URL**
```
http://api.backhaus.test:3055/api/v1/dashboard
```

---

## 📋 **API Endpoints**

### **Authentication Endpoints** 🔐

#### **CSRF Token**
```http
GET /api/v1/dashboard/auth/csrf-token
```
- **Description**: Generate CSRF token for admin forms
- **Authentication**: None required
- **Response**: CSRF token for form submissions
- **Cookie**: Sets `XSRF-TOKEN-DASHBOARD` cookie
- **Headers**: Exposes `X-Dashboard-CSRF-Token` header

#### **Login**
```http
POST /api/v1/dashboard/auth/login
```
- **Description**: Admin login
- **Authentication**: None required
- **CSRF**: Required
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123",
    "remember": true
  }
  ```
- **Response**:
  ```json
  {
    "status": true,
    "message": "Login successful",
    "data": {
      "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
      "admin": {
        "id": "uuid",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "name": "John Doe",
        "role": "admin",
        "apps": ["dashboard", "support"]
      }
    }
  }
  ```

#### **Refresh Token**
```http
POST /api/v1/dashboard/auth/refresh
```
- **Description**: Refresh access token
- **Authentication**: None required
- **CSRF**: Required
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response**:
  ```json
  {
    "status": true,
    "message": "Token refreshed successfully",
    "data": {
      "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
  ```

#### **Logout**
```http
POST /api/v1/dashboard/auth/logout
```
- **Description**: Logout current session
- **Authentication**: Required
- **CSRF**: Required

#### **Logout All Devices**
```http
POST /api/v1/dashboard/auth/logout-all
```
- **Description**: Logout all sessions
- **Authentication**: Required
- **CSRF**: Required

#### **Check Authentication**
```http
GET /api/v1/dashboard/auth/check
```
- **Description**: Validate access token and get admin data
- **Authentication**: Required (Bearer token in header)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**:
  ```json
  {
    "status": true,
    "message": "Authentication check successful",
    "data": {
      "admin": {
        "id": "uuid",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "name": "John Doe",
        "role": "admin",
        "apps": ["dashboard", "support"]
      }
    }
  }
  ```

#### **Admin Data**
```http
GET /api/v1/dashboard/auth/admin-data
```
- **Description**: Get comprehensive admin data
- **Authentication**: Required
- **Response**: Categories, groups, addresses, companies, occupations

### **Password Management** 🔑

#### **Change Password**
```http
POST /api/v1/dashboard/auth/change-password
```
- **Description**: Change admin password
- **Authentication**: Required
- **CSRF**: Required

#### **Request Password Reset**
```http
POST /api/v1/dashboard/auth/request-reset
```
- **Description**: Request password reset
- **Authentication**: None required
- **CSRF**: Required

#### **Verify Password Reset**
```http
POST /api/v1/dashboard/auth/verify-reset
```
- **Description**: Verify password reset code
- **Authentication**: None required
- **CSRF**: Required

#### **Resend Reset Code**
```http
POST /api/v1/dashboard/auth/resend-code
```
- **Description**: Resend password reset code
- **Authentication**: None required
- **CSRF**: Required

### **Profile Management** 👤

#### **Get Profile**
```http
GET /api/v1/dashboard/auth/profile
```
- **Description**: Get admin profile
- **Authentication**: Required

#### **Update Profile**
```http
PUT /api/v1/dashboard/auth/profile
```
- **Description**: Update admin profile
- **Authentication**: Required
- **CSRF**: Required

#### **My Support Tasks**
```http
GET /api/v1/dashboard/auth/profile/tasks
```
- **Description**: Get admin's support tasks
- **Authentication**: Required

---

## 🍪 **Cookie Configuration**

### **Authentication Cookies**
- **Domain**: `backhaus.test` (shared across subdomains)
- **SameSite**: `lax` (better compatibility)
- **HttpOnly**: `true` (XSS protection)
- **Secure**: `false` (development), `true` (production)

### **Cookie Names**
- `BKJH_ACCESS_TOKEN`: 15 minutes (if using cookies)
- `BKJH_REFRESH_TOKEN`: 7 days (if using cookies)
- `XSRF-TOKEN-DASHBOARD`: 1 hour (CSRF token)

---

## 📊 **Admin Data Endpoint**

### **Get Admin Data**
```http
GET /api/v1/dashboard/auth/admin-data
```

**Response includes:**
- Categories (ticket categories, event categories)
- Groups (with addresses)
- Addresses
- Companies (with addresses, no groups)
- Occupations

---

## 🚧 **Implementation Status**

### **✅ Completed**
- [x] JWT Authentication system
- [x] Admin guards and role-based access
- [x] CSRF token generation
- [x] Cookie-based authentication
- [x] Password reset system
- [x] Admin data endpoint
- [x] Profile management
- [x] Rate limiting

### **🔄 In Progress**
- [ ] Additional admin endpoints
- [ ] Admin user management
- [ ] System settings management

---

## 📝 **Usage Examples**

### **Login Flow**
```javascript
// 1. Get CSRF token
const csrfResponse = await fetch('/api/v1/dashboard/auth/csrf-token', {
  credentials: 'include'
});
const csrfData = await csrfResponse.json();

// 2. Login
const loginResponse = await fetch('/api/v1/dashboard/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrfData.data.csrfToken
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123',
    remember: true
  })
});

// 3. Get admin data
const adminDataResponse = await fetch('/api/v1/dashboard/auth/admin-data', {
  credentials: 'include'
});
```

### **Check Authentication**
```javascript
// Validate token and get admin data
const checkResponse = await fetch('/api/v1/dashboard/auth/check', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### **Protected API Calls**
```javascript
// All subsequent API calls automatically include cookies
const response = await fetch('/api/v1/dashboard/some-endpoint', {
  credentials: 'include'
});
```

---

## 🏪 **Pinia Store Implementation Guide**

### **stores/user.ts Structure**
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Admin {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  role: string
  apps: string[]
}

interface Tokens {
  accessToken: string
  refreshToken: string
}

interface ApiResponse<T> {
  status: boolean
  message: string
  data: T
}

export const useUserStore = defineStore('user', () => {
  // Cookies for persistent token storage
  const accessToken = useCookie('BKJH_ACCESS_TOKEN', { 
    maxAge: 60 * 15, // 15 minutes (matches backend)
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  const refreshToken = useCookie('BKJH_REFRESH_TOKEN', { 
    maxAge: 60 * 60 * 24 * 7, // 7 days (matches backend)
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  // State
  const admin = ref<Admin | null>(null)
  const csrfToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!admin.value && !!accessToken.value)
  const hasAppAccess = computed(() => (app: string) => admin.value?.apps?.includes(app) || false)
  const tokens = computed(() => ({
    accessToken: accessToken.value,
    refreshToken: refreshToken.value
  }))

  // Actions
  const getCsrfToken = async () => {
    try {
      const response = await fetch('/api/v1/dashboard/auth/csrf-token', {
        credentials: 'include'
      })
      const data: ApiResponse<{ csrfToken: string }> = await response.json()
      csrfToken.value = data.data.csrfToken
      return data.data.csrfToken
    } catch (err) {
      error.value = 'Failed to get CSRF token'
      throw err
    }
  }

  const login = async (email: string, password: string, remember = false) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Get CSRF token first
      await getCsrfToken()
      
      const response = await fetch('/api/v1/dashboard/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken.value!
        },
        body: JSON.stringify({ email, password, remember })
      })
      
      const data: ApiResponse<{ tokens: Tokens; admin: Admin }> = await response.json()
      
      if (data.status) {
        // Store tokens in cookies
        accessToken.value = data.data.tokens.accessToken
        refreshToken.value = data.data.tokens.refreshToken
        admin.value = data.data.admin
        return data
      } else {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const refreshAuthToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      await getCsrfToken()
      
      const response = await fetch('/api/v1/dashboard/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken.value!
        },
        body: JSON.stringify({ refreshToken: refreshToken.value })
      })
      
      const data: ApiResponse<{ tokens: Tokens }> = await response.json()
      
      if (data.status) {
        // Update tokens in cookies
        accessToken.value = data.data.tokens.accessToken
        refreshToken.value = data.data.tokens.refreshToken
        return data
      } else {
        throw new Error(data.message)
      }
    } catch (err) {
      // Refresh failed, logout user
      await logout()
      throw err
    }
  }

  const checkAuth = async () => {
    if (!accessToken.value) {
      return false
    }

    try {
      const response = await fetch('/api/v1/dashboard/auth/check', {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })
      
      const data: ApiResponse<{ admin: Admin }> = await response.json()
      
      if (data.status) {
        admin.value = data.data.admin
        return true
      } else {
        return false
      }
    } catch (err) {
      return false
    }
  }

  const logout = async () => {
    if (!accessToken.value) return

    try {
      await getCsrfToken()
      
      await fetch('/api/v1/dashboard/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'X-CSRF-TOKEN': csrfToken.value!
        }
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear state regardless of API response
      admin.value = null
      accessToken.value = null
      refreshToken.value = null
      csrfToken.value = null
      error.value = null
    }
  }

  const logoutAll = async () => {
    if (!accessToken.value) return

    try {
      await getCsrfToken()
      
      await fetch('/api/v1/dashboard/auth/logout-all', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'X-CSRF-TOKEN': csrfToken.value!
        }
      })
    } catch (err) {
      console.error('Logout all error:', err)
    } finally {
      // Clear state regardless of API response
      admin.value = null
      accessToken.value = null
      refreshToken.value = null
      csrfToken.value = null
      error.value = null
    }
  }

  return {
    // State
    admin,
    accessToken,
    refreshToken,
    csrfToken,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    hasAppAccess,
    tokens,
    // Actions
    getCsrfToken,
    login,
    refreshAuthToken,
    checkAuth,
    logout,
    logoutAll
  }
})
```

### **Cookie Benefits**
- ✅ **Persistent**: Survives hard refresh, browser restart
- ✅ **Automatic**: Nuxt handles cookie serialization/deserialization
- ✅ **Secure**: Configurable httpOnly, secure, sameSite options
- ✅ **SSR Compatible**: Works with server-side rendering
- ✅ **Auto Expiry**: Tokens automatically expire based on maxAge

### **Usage in Components**
```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// Login
const handleLogin = async () => {
  try {
    await userStore.login('admin@example.com', 'password123', true)
    // Redirect to dashboard
  } catch (error) {
    // Handle error
  }
}

// Check auth on app start (tokens persist in cookies)
const initAuth = async () => {
  const isAuth = await userStore.checkAuth()
  if (!isAuth) {
    // Redirect to login
  }
}

// Access tokens directly from cookies
const currentToken = userStore.accessToken
const isLoggedIn = userStore.isAuthenticated
</script>
```

### **Auto Token Refresh (Optional)**
```typescript
// In your app.vue or main layout
export default defineNuxtComponent({
  setup() {
    const userStore = useUserStore()
    
    // Auto refresh token before expiry
    const refreshInterval = setInterval(async () => {
      if (userStore.isAuthenticated && userStore.refreshToken) {
        try {
          await userStore.refreshAuthToken()
        } catch (error) {
          // Token refresh failed, user will be logged out
          console.error('Token refresh failed:', error)
        }
      }
    }, 14 * 60 * 1000) // Refresh every 14 minutes (before 15min expiry)
    
    onUnmounted(() => {
      clearInterval(refreshInterval)
    })
  }
})
```

---

## 🛡️ **Required Frontend Middleware Files**

### **middleware/auth.ts** (Protected Routes)
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  
  // Check if user is authenticated
  if (!userStore.isAuthenticated) {
    // Redirect to login page
    return navigateTo('/login')
  }
  
  // Optional: Check app access for specific routes
  if (to.path.startsWith('/admin') && !userStore.hasAppAccess('admin')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin privileges required.'
    })
  }
  
  if (to.path.startsWith('/academy') && !userStore.hasAppAccess('academy')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Academy access required.'
    })
  }
})
```

### **middleware/guest.ts** (Public Routes - Redirect if Authenticated)
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  
  // If user is already authenticated, redirect to dashboard
  if (userStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})
```

### **middleware/auth-check.ts** (Auto Authentication Check)
```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore()
  
  // Only run auth check if we have tokens but no admin data
  if (userStore.accessToken && !userStore.admin) {
    try {
      const isAuthenticated = await userStore.checkAuth()
      if (!isAuthenticated) {
        // Token is invalid, clear everything and redirect to login
        await userStore.logout()
        return navigateTo('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      await userStore.logout()
      return navigateTo('/login')
    }
  }
})
```

### **middleware/csrf.ts** (CSRF Token Management)
```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore()
  
  // Only fetch CSRF token for protected routes that need it
  const protectedRoutes = ['/dashboard', '/admin', '/academy']
  const needsCsrf = protectedRoutes.some(route => to.path.startsWith(route))
  
  if (needsCsrf && !userStore.csrfToken) {
    try {
      await userStore.getCsrfToken()
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
      // Don't block navigation, but log the error
    }
  }
})
```

---

## 📁 **Your Frontend File Structure**
```
your-frontend-project/
├── middleware/
│   ├── auth.ts          # Protected routes middleware
│   ├── guest.ts         # Public routes middleware  
│   ├── auth-check.ts    # Auto authentication check
│   └── csrf.ts          # CSRF token management
├── stores/
│   └── user.ts          # Updated Pinia store with cookies
├── pages/
│   ├── login.vue        # ✅ Guest middleware
│   ├── forgot-password.vue  # ✅ Guest middleware
│   ├── reset-password.vue   # ✅ Guest middleware
│   ├── index.vue        # ✅ Auth middleware (dashboard home)
│   ├── events/          # ✅ Auth middleware
│   ├── master-data/     # ✅ Auth middleware
│   ├── profile/         # ✅ Auth middleware
│   ├── settings/        # ✅ Auth middleware
│   └── support-tickets/ # ✅ Auth middleware
└── nuxt.config.ts       # Nuxt configuration
```

---

## ⚙️ **Nuxt Configuration Updates**

### **nuxt.config.ts**
```typescript
export default defineNuxtConfig({
  // ... other config
  
  // Runtime config for API base URL
  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'production' 
        ? 'https://api.backhaus.de' 
        : 'http://api.backhaus.test:3055'
    }
  },
  
  // Cookie configuration
  cookie: {
    prefix: 'BKJH_',
    options: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false // Allow client-side access for tokens
    }
  }
})
```

---

## 🚀 **API Endpoints & Specifications**

### **Base URL Configuration**
```typescript
// Your nuxt.config.ts
runtimeConfig: {
  public: {
    apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://api.backhaus.test:3055'
  }
}

// Usage in your app
const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
```

---

## 🔧 **useApiFetch Composable Updates**

### **Updated useApiFetch.ts**
```typescript
// composables/useApiFetch.ts
import { useRequestHeaders, useFetch, useCookie } from 'nuxt/app'
import { toast } from 'vue-sonner'
import type { UseFetchOptions } from 'nuxt/app'

export function useApiFetch<T = unknown>(
    path: string,
    options: UseFetchOptions<T> = {},
) {
    const config = useRuntimeConfig()
    
    // Helper function to get CSRF token for state-changing requests
    const getCSRFToken = async () => {
        const method = String(options.method || 'GET').toUpperCase()
        
        // Only fetch CSRF token for state-changing requests
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
                // Use $fetch instead of useFetch to avoid caching issues
                const csrfData = await $fetch(`${config.public.apiUrl}/api/v1/dashboard/auth/csrf-token`, {
                    credentials: 'include',
                    headers: {
                        'accept': 'application/json',
                        'x-requested-with': 'XMLHttpRequest',
                        'referer': process.client ? window.location.origin : 'http://dashboard.backhaus.test:3022',
                        'origin': process.client ? window.location.origin : 'http://dashboard.backhaus.test:3022',
                    }
                })
                return (csrfData as any)?.data?.csrfToken
            } catch (error) {
                console.warn('Failed to fetch CSRF token:', error)
                return null
            }
        }
        return null
    }

    // Use Record<string, string> instead of `HeadersObject`
    const headers: Record<string, string> = {
        accept: 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        referer: process.client ? window.location.origin : 'http://dashboard.backhaus.test:3022',
        origin: process.client ? window.location.origin : 'http://dashboard.backhaus.test:3022',
    }

    // Add Content-Type header for requests with body
    const method = String(options.method || 'GET').toUpperCase()
    if (['POST', 'PUT', 'PATCH'].includes(method) && options.body) {
        headers['content-type'] = 'application/json'
    }    

    // Get auth token and add to headers if available
    const accessToken = useCookie('BKJH_ACCESS_TOKEN')
    if (accessToken.value) {
        headers.Authorization = `Bearer ${accessToken.value}`
    }

    // Append server-side headers
    if (process.server) {
        Object.assign(headers, useRequestHeaders(['cookie']))
    }
    
    return useFetch(`${config.public.apiUrl}` + path, {
        credentials: 'include',
        watch: false,
        key: `${path}-${Date.now()}`, // Add cache busting key
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string>),
        },
        onResponseError({ response }) {
            // Handle 401 Unauthorized - attempt token refresh
            if (response.status === 401 && process.client) {
                const refreshToken = useCookie('BKJH_REFRESH_TOKEN')
                if (refreshToken.value) {
                    // Attempt to refresh token
                    useApiFetch('/api/v1/dashboard/auth/refresh', {
                        method: 'POST',
                        body: { refreshToken: refreshToken.value }
                    }).then(({ data: refreshData, error: refreshError }) => {
                        if (refreshData.value && !refreshError.value) {
                            const refreshResponse = refreshData.value as any
                            if (refreshResponse.data?.tokens) {
                                const accessToken = useCookie('BKJH_ACCESS_TOKEN')
                                const newRefreshToken = useCookie('BKJH_REFRESH_TOKEN')
                                accessToken.value = refreshResponse.data.tokens.accessToken
                                newRefreshToken.value = refreshResponse.data.tokens.refreshToken
                                
                                // Show success notification
                                toast.success('Session refreshed', {
                                    description: 'Your session has been automatically renewed',
                                    duration: 3000,
                                })
                            }
                        } else {
                            // Refresh failed, redirect to login
                            toast.error('Session expired', {
                                description: 'Please login again',
                                duration: 4000,
                            })
                            navigateTo('/login')
                        }
                    }).catch(() => {
                        toast.error('Session expired', {
                            description: 'Please login again',
                            duration: 4000,
                        })
                        navigateTo('/login')
                    })
                } else {
                    // No refresh token, redirect to login
                    toast.error('Authentication required', {
                        description: 'Please login to continue',
                        duration: 4000,
                    })
                    navigateTo('/login')
                }
            }
            
            // Handle other error statuses
            if (response.status === 403) {
                toast.error('Access denied', {
                    description: 'You do not have permission to perform this action',
                    duration: 5000,
                })
            } else if (response.status >= 500) {
                toast.error('Server error', {
                    description: 'Something went wrong. Please try again later',
                    duration: 5000,
                })
            }
        },
        async onRequest({ request, options: requestOptions }) {
            // Get CSRF token for state-changing requests
            const csrfToken = await getCSRFToken()
            if (csrfToken && requestOptions.headers) {
                (requestOptions.headers as unknown as Record<string, string>)['X-CSRF-TOKEN'] = csrfToken
            }
            
            if (process.env.NODE_ENV === 'development') {
                console.log('API Request:', {
                    url: request,
                    headers: requestOptions.headers,
                    method: requestOptions.method || 'GET'
                })
            }
        },
    })
}
```

### **Key Updates Made:**
1. **✅ Fixed Token Refresh Response**: Updated to use `refreshResponse.data.tokens` structure
2. **✅ Enhanced Error Handling**: Added toast notifications for different error types
3. **✅ Better User Feedback**: Success/error messages for token refresh
4. **✅ Improved Error Messages**: More specific error handling for 403, 500+ status codes
5. **✅ Consistent Structure**: Matches your backend API response format

---

## 🔐 **Authentication APIs**

### **1. Login**
- **Method**: `POST`
- **Endpoint**: `/api/v1/dashboard/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
  - `X-CSRF-TOKEN: {csrfToken}` (required)
- **Payload**:
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "remember": true
}
```
- **Response**:
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "admin": {
      "id": "admin-uuid",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "role": "super_admin",
      "apps": ["dashboard", "academy", "support"]
    }
  }
}
```

### **2. Refresh Token**
- **Method**: `POST`
- **Endpoint**: `/api/v1/dashboard/auth/refresh`
- **Headers**: 
  - `Content-Type: application/json`
  - `X-CSRF-TOKEN: {csrfToken}` (required)
- **Payload**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response**:
```json
{
  "status": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### **3. Check Authentication**
- **Method**: `GET`
- **Endpoint**: `/api/v1/dashboard/auth/check`
- **Headers**: 
  - `Authorization: Bearer {accessToken}`
- **Response**:
```json
{
  "status": true,
  "message": "Authentication valid",
  "data": {
    "admin": {
      "id": "admin-uuid",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "role": "super_admin",
      "apps": ["dashboard", "academy", "support"]
    }
  }
}
```

### **4. Logout**
- **Method**: `POST`
- **Endpoint**: `/api/v1/dashboard/auth/logout`
- **Headers**: 
  - `Authorization: Bearer {accessToken}`
  - `X-CSRF-TOKEN: {csrfToken}` (required)
- **Response**:
```json
{
  "status": true,
  "message": "Logged out successfully"
}
```

### **5. Logout All Sessions**
- **Method**: `POST`
- **Endpoint**: `/api/v1/dashboard/auth/logout-all`
- **Headers**: 
  - `Authorization: Bearer {accessToken}`
  - `X-CSRF-TOKEN: {csrfToken}` (required)
- **Response**:
```json
{
  "status": true,
  "message": "All sessions logged out successfully"
}
```

### **6. Forgot Password**
- **Method**: `POST`
- **Endpoint**: `/api/v1/dashboard/auth/forgot-password`
- **Headers**: 
  - `Content-Type: application/json`
- **Payload**:
```json
{
  "email": "admin@example.com"
}
```
- **Response**:
```json
{
  "status": true,
  "message": "Password reset email sent"
}
```

### **7. Reset Password**
- **Method**: `POST`
- **Endpoint**: `/api/v1/dashboard/auth/reset-password`
- **Headers**: 
  - `Content-Type: application/json`
- **Payload**:
```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123"
}
```
- **Response**:
```json
{
  "status": true,
  "message": "Password reset successfully"
}
```

### **8. Get Admin Data**
- **Method**: `GET`
- **Endpoint**: `/api/v1/dashboard/auth/admin-data`
- **Headers**: 
  - `Authorization: Bearer {accessToken}`
- **Response**:
```json
{
  "status": true,
  "message": "Admin data retrieved successfully",
  "data": {
    "admin": {
      "id": "admin-uuid",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "role": "super_admin",
      "apps": ["dashboard", "academy", "support"]
    },
    "stats": {
      "totalUsers": 150,
      "totalEvents": 25,
      "totalTickets": 8
    }
  }
}
```

---

## 🛡️ **CSRF Protection**

### **Get CSRF Token**
- **Method**: `GET`
- **Endpoint**: `/api/v1/dashboard/auth/csrf-token`
- **Headers**: None required
- **Response**:
```json
{
  "status": true,
  "message": "CSRF token generated for dashboard",
  "data": {
    "csrfToken": "csrf-token-string"
  }
}
```
- **Cookie**: `XSRF-TOKEN-DASHBOARD` (automatically set)

---

## 📊 **Error Responses**

### **Authentication Errors**
```json
{
  "status": false,
  "message": "Invalid credentials",
  "error": "UNAUTHORIZED"
}
```

### **CSRF Errors**
```json
{
  "status": false,
  "message": "CSRF token mismatch",
  "error": "CSRF_TOKEN_MISMATCH"
}
```

### **Validation Errors**
```json
{
  "status": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### **Rate Limit Errors**
```json
{
  "status": false,
  "message": "Too many requests",
  "error": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```


---

## 🔔 **Notification System Integration**

### **Vue Sonner Toast Configuration**
Your app uses `vue-sonner` for notifications. Here's how to integrate it with your authentication system:

#### **Toast Types Used:**
- **✅ Success**: Login success, password reset, logout
- **❌ Error**: Login failed, validation errors, network errors
- **⏰ Duration**: 3000-5000ms based on message importance

#### **Example Toast Usage:**
```typescript
import { toast } from 'vue-sonner'

// Success notification
toast.success('Welcome back!', {
  description: 'You have been successfully logged in',
  duration: 3000,
})

// Error notification
toast.error('Login failed', {
  description: 'Invalid email or password',
  duration: 5000,
})
```

---

## 🏪 **Pinia Store Implementation**

### **stores/user.ts - Complete Implementation**
```typescript
// stores/user.ts
import { toast } from 'vue-sonner'

// Types (local to this file only)
interface Admin {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  role: string
  apps: string[]
}

interface Tokens {
  accessToken: string
  refreshToken: string
}

interface ApiResponse<T> {
  status: boolean
  message: string
  data: T
}

interface LoginPayload {
  email: string
  password: string
  remember: boolean
}

interface RefreshPayload {
  refreshToken: string
}

export const useUserStore = defineStore('user', () => {
  // Cookies for persistent token storage
  const accessToken = useCookie('BKJH_ACCESS_TOKEN', { 
    maxAge: 60 * 15, // 15 minutes (matches backend)
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  const refreshToken = useCookie('BKJH_REFRESH_TOKEN', { 
    maxAge: 60 * 60 * 24 * 7, // 7 days (matches backend)
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  // State
  const admin = ref<Admin | null>(null)
  const csrfToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!admin.value && !!accessToken.value)
  const hasAppAccess = computed(() => (app: string) => admin.value?.apps?.includes(app) || false)
  const tokens = computed(() => ({
    accessToken: accessToken.value,
    refreshToken: refreshToken.value
  }))

  // Actions
  const getCsrfToken = async () => {
    try {
      const { data } = await useApiFetch<ApiResponse<{ csrfToken: string }>>('/api/v1/dashboard/auth/csrf-token')
      
      if (data.value?.status) {
        csrfToken.value = data.value.data.csrfToken
        return data.value.data.csrfToken
      } else {
        throw new Error('Failed to get CSRF token')
      }
    } catch (err) {
      console.error('CSRF token error:', err)
      throw err
    }
  }

  const login = async (email: string, password: string, remember: boolean = false) => {
    isLoading.value = true
    error.value = ''

    try {
      const payload: LoginPayload = { email, password, remember }
      
      const { data } = await useApiFetch<ApiResponse<{ tokens: Tokens; admin: Admin }>>('/api/v1/dashboard/auth/login', {
        method: 'POST',
        body: payload
      })
      
      if (data.value?.status) {
        // Store tokens in cookies
        accessToken.value = data.value.data.tokens.accessToken
        refreshToken.value = data.value.data.tokens.refreshToken
        admin.value = data.value.data.admin
        
        // Success notification
        toast.success('Welcome back!', {
          description: 'You have been successfully logged in',
          duration: 3000,
        })
        
        return data.value
      } else {
        throw new Error(data.value?.message || 'Login failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      error.value = errorMessage
      
      // Error notification
      toast.error('Login failed', {
        description: errorMessage,
        duration: 5000,
      })
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const refreshAuthToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const payload: RefreshPayload = { refreshToken: refreshToken.value }
      
      const { data } = await useApiFetch<ApiResponse<{ tokens: Tokens }>>('/api/v1/dashboard/auth/refresh', {
        method: 'POST',
        body: payload
      })
      
      if (data.value?.status) {
        // Update tokens in cookies
        accessToken.value = data.value.data.tokens.accessToken
        refreshToken.value = data.value.data.tokens.refreshToken
        return data.value
      } else {
        throw new Error(data.value?.message || 'Token refresh failed')
      }
    } catch (err) {
      // Refresh failed, logout user
      await logout()
      throw err
    }
  }

  const checkAuth = async () => {
    if (!accessToken.value) {
      return false
    }

    try {
      const { data } = await useApiFetch<ApiResponse<{ admin: Admin }>>('/api/v1/dashboard/auth/check')
      
      if (data.value?.status) {
        admin.value = data.value.data.admin
        return true
      } else {
        return false
      }
    } catch (err) {
      return false
    }
  }

  const logout = async () => {
    if (!accessToken.value) return

    try {
      await useApiFetch('/api/v1/dashboard/auth/logout', {
        method: 'POST'
      })
      
      // Success notification
      toast.success('Goodbye!', {
        description: 'You have been successfully logged out',
        duration: 3000,
      })
    } catch (err) {
      console.error('Logout error:', err)
      
      // Error notification
      toast.error('Logout failed', {
        description: 'Please try again later',
        duration: 4000,
      })
    } finally {
      // Clear state regardless of API response
      admin.value = null
      accessToken.value = null
      refreshToken.value = null
      csrfToken.value = null
      error.value = null
    }
  }

  const logoutAll = async () => {
    if (!accessToken.value) return

    try {
      await useApiFetch('/api/v1/dashboard/auth/logout-all', {
        method: 'POST'
      })
      
      // Success notification
      toast.success('All sessions logged out', {
        description: 'You have been logged out from all devices',
        duration: 3000,
      })
    } catch (err) {
      console.error('Logout all error:', err)
      
      // Error notification
      toast.error('Logout failed', {
        description: 'Please try again later',
        duration: 4000,
      })
    } finally {
      // Clear state regardless of API response
      admin.value = null
      accessToken.value = null
      refreshToken.value = null
      csrfToken.value = null
      error.value = null
    }
  }

  const getAdminData = async () => {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }

    try {
      const { data } = await useApiFetch<ApiResponse<{ admin: Admin; stats: any }>>('/api/v1/dashboard/auth/admin-data')
      
      if (data.value?.status) {
        admin.value = data.value.data.admin
        return data.value
      } else {
        throw new Error(data.value?.message || 'Failed to get admin data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get admin data'
      error.value = errorMessage
      throw err
    }
  }

  return {
    // State
    admin,
    accessToken,
    refreshToken,
    csrfToken,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    hasAppAccess,
    tokens,
    // Actions
    getCsrfToken,
    login,
    refreshAuthToken,
    checkAuth,
    logout,
    logoutAll,
    getAdminData
  }
})
```

### **Key Features:**
1. **✅ Strong TypeScript**: All interfaces defined locally in the store
2. **✅ useApiFetch Integration**: Uses your composable for all API calls
3. **✅ Cookie Persistence**: Tokens stored in cookies for persistence
4. **✅ Auto CSRF**: CSRF tokens handled automatically by useApiFetch
5. **✅ Error Handling**: Comprehensive error handling with toast notifications
6. **✅ Auto Token Refresh**: Handled by useApiFetch composable
7. **✅ Nuxt 4 Compatible**: Uses auto-imports and modern Nuxt patterns

---

## ⚠️ **Security Notes**

- **Admin Only**: All endpoints require admin authentication
- **JWT Tokens**: Stored as HTTP-only cookies
- **CSRF Protection**: Required for all form submissions
- **Rate Limiting**: Applied to prevent abuse
- **Domain Isolation**: Separate from other subdomains
- **Session Management**: Automatic token refresh

---

## 🔧 **CSRF Configuration**

### **Isolated CSRF System**
- **Service**: `DashboardCsrfService` (isolated)
- **Middleware**: `DashboardCsrfMiddleware` (isolated)
- **Module**: `DashboardCsrfModule` (isolated)
- **Session Secret**: `dashboardCsrfSecret` (separate from global)
- **Cookie Name**: `XSRF-TOKEN-DASHBOARD`
- **Header Name**: `X-Dashboard-CSRF-Token`
- **Routes**: Only applies to `/api/v1/dashboard/*`

### **Environment Variables**
- `DASHBOARD_CSRF_ENABLED`: Enable/disable CSRF (default: true)
- `BASE_DOMAIN`: Base domain for cookie sharing

### **Public Endpoints (No CSRF Required)**
- `GET /api/v1/dashboard/auth/csrf-token`
- `POST /api/v1/dashboard/auth/login`
- `POST /api/v1/dashboard/auth/refresh-token`
- `POST /api/v1/dashboard/auth/request-reset`
- `POST /api/v1/dashboard/auth/verify-reset`

### **Domain Guards**
- Configured for `dashboard.backhaus.test`
- Validates subdomain access

### **Rate Limiting**
- Login: 5 attempts per 15 minutes
- Password change: 10 requests per minute
- General API: Dashboard throttle

### **JWT Configuration**
- Access token: 15 minutes
- Refresh token: 7 days
- Secret: From environment variables
