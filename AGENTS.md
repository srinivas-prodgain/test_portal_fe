## Overview

This document contains essential development guidelines for the Next.js Frontend, covering React/TypeScript patterns, project structure conventions, component implementation, API integration, and type definitions.

---

## Base Rules and Project Conventions

### React/TypeScript Patterns

1. Use arrow function expressions with explicit return types in camelCase format

   ```typescript
   // Correct
   const getUserById = (id: string): TUser | null => {
     // implementation
   }

   // Incorrect
   function getUserData(id: string) {
     // implementation
   }
   const get_user_by_id = (id: string): TUser | null => {
     // implementation
   }
   ```

2. Always use object-based parameter passing, even for single parameters

   ```typescript
   // Correct - single parameter
   const getUserById = ({ id }: { id: string }): TUser | null => {
     // implementation
   }

   // Correct - multiple parameters with defaults
   const createUserCard = ({
     name,
     email,
     role = 'user'
   }: TCreateUserCardProps): JSX.Element => {
     // implementation
   }

   // Incorrect - direct parameter passing
   const fetchUserById = (id: string): TUser | null => {
     // implementation
   }
   ```

3. **File Organization**: Place the main exported function at the top of the file, followed by helper functions
4. Prefer function expressions over function declarations
5. Keep file size small (200-300 lines) and focus on single responsibility
6. Avoid using `any` type - use proper typing or `unknown` when necessary
7. Prefer `const` over `let`, avoid `var` completely
8. Use early returns to reduce nesting and improve readability
9. Always do named exports for components, functions, types etc.
10. Use optional chaining and nullish coalescing operators

    ```typescript
    const userName = user?.name ?? 'Anonymous'
    ```

11. **Use proper React conventions:**
    - Prefer functional components over class components
    - Use hooks for state management and side effects
    - Implement proper dependency arrays in useEffect (never put functions in dependencies)
    - Use useMemo/useCallback/memo only in extreme cases with proper justification in comments
    - Prefer async/await over callbacks or promises

### Project Structure

1. **Directory Organization**
   - `/src/app`: Next.js app directory for routing (route groups, layouts, pages)
   - `/src/components`: Reusable UI components organized by domain
   - `/src/hooks`: Custom React hooks (api, custom)
   - `/src/lib`: Utility functions and configurations
   - `/src/providers`: React context providers and global state
   - `/src/services`: External service integrations (Firebase, etc.)
   - `/src/types`: TypeScript type definitions
   - `/src/constants`: Application constants and environment variables
   - `/src/assets`: Static assets (images, fonts, etc.)
   - `/src/styles`: Global stylesheets

2. **Component Organization**
   - `/components/shared`: Shared components used across the app
   - `/components/[domain]`: Domain-specific components (sales-rep, session, message)
   - Each component directory should contain related components

3. **File Naming**
   - Use kebab-case for file names: `user-profile.tsx`
   - Use camelCase for function and variable names: `getUserProfile`
   - Use PascalCase for component names: `UserProfilePage`
   - Use PascalCase for types: `TUserProfile`

### Component Patterns

1. **Component Structure**

   ```tsx
   // Main exported component at top
   export const UserCard = ({ user, onEdit, className }: TUserCardProps) => {
     // Early returns for loading/error states
     if (!user) return null

     // Conditional logic assigned to variables (max 2 conditions in UI)
     const canEdit = user.permissions?.includes('edit') && onEdit
     const isActive = user.status === 'active'

     // Event handlers
     const handleEditClick = () => {
       onEdit?.({ user })
     }

     // Render with conditional CSS using cn()
     return (
       <div
         className={cn(
           'user-card rounded-lg border p-4',
           isActive && 'border-green-200 bg-green-50',
           className
         )}
       >
         {canEdit && <EditButton onClick={handleEditClick} />}
       </div>
     )
   }

   // Component props type after main component
   type TUserCardProps = {
     user: TUser
     onEdit?: ({ user }: { user: TUser }) => void
     className?: string
   }

   // Helper components used only in this component
   const EditButton = ({ onClick }: { onClick: () => void }) => (
     <Button variant="outline" onClick={onClick}>
       Edit
     </Button>
   )
   ```

2. **Component Organization by Usage**
   - If a sub-component is only used in a particular page, keep it at page level
   - If component is used across multiple pages at same level, keep it in parent directory
   - Use Shadcn components or custom components built on top of Shadcn over creating new similar components

3. **Conditional Rendering Best Practices**

   ```tsx
   const MyComponent = ({ user, status, error }: TComponentProps) => {
     // Assign complex conditions to variables (max 2 conditions in UI)
     const isLoading = status === 'loading'
     const hasError = error && !isLoading
     const canShowContent = user && !isLoading && !hasError

     // Use early returns for simple conditions
     if (isLoading) return <Loader />
     if (hasError) return <ErrorMessage message={error.message} />

     // Clean conditional rendering in UI
     return <div>{canShowContent && <UserProfile user={user} />}</div>
   }
   ```

### Error Handling

1. Use error boundaries for component-level error handling
2. Handle async errors in hooks and display user-friendly messages
3. Use toast notifications for error feedback
4. Implement proper loading and error states in components
5. Validate props using TypeScript and runtime validation where needed

### Asynchronous Code & API Integration

1. **Always create API hooks using TanStack Query pattern (Type + Service + Hook)**
2. Get error/success messages from API response: `success.message`, `error.message`
3. Use async/await over callbacks or promises
4. Avoid useEffect for data fetching - prefer React Query hooks
5. Never put functions in useEffect dependencies

### Performance Considerations

1. **Avoid unnecessary optimizations**: Don't bloat codebase with useMemo/useCallback/memo
2. Use React.memo/useMemo/useCallback only in extreme cases with proper justification in comments
3. Implement proper key props for list items
4. Use proper loading states to prevent layout shifts
5. Create similar-looking skeletons for pages at same level
6. Don't bloat pages with unnecessary divs - use advanced CSS if needed

---

## TypeScript Type Definition Conventions

### Rules

1. Prefix type names with 'T' (e.g., TUserProfile, TApiResponse)
2. Use type aliases over interfaces except for extendable object shapes
3. Use Record<K,T> for dynamic object types instead of { [key: string]: any }
4. Import types from '@/types' (app specific) directory or '@sales-os/shared' (models, common)
5. Use union types over type overloads when possible
6. Define component props types inline or in the same file

### Examples

```tsx
// Correct - Component props type
type TUserCardProps = {
  user: TUser
  onEdit?: (user: TUser) => void
  className?: string
}

// Correct - API response type
type TApiResponse<T = undefined> = {
  message: string
  data?: T
  pagination?: TPaginationResponse
}

// Correct - Union type for variants
type TButtonVariant = 'primary' | 'secondary' | 'destructive'

// Incorrect - missing T prefix
type BadType = {
  data: any
  [key: string]: any
}

// Incorrect - using interface for simple types
interface IUserData {
  id: string
}
```

---

## Component Development Guidelines

### Component Implementation Rules

- Use functional components with TypeScript
- Define props types in the same file as the component
- Implement proper error boundaries for critical components
- Use React Query hooks for API data fetching
- Implement proper loading and error states
- Follow responsive design principles with Tailwind CSS

### Route Components (Page Components)

```tsx
// app/dashboard/users/page.tsx
'use client'

import {
  ErrorPage,
  PageHeader,
  PageLoader,
  UsersList
} from '@/components/shared'
import { useGetAllUsers } from '@/hooks/api/user'

// Main page component at top
const UsersPage = () => {
  const { data: users, isLoading, error } = useGetAllUsers({ page: 1 })

  // Early returns with error messages from API
  if (isLoading) return <PageLoader />
  if (error) return <ErrorPage message={error.message} />

  // Conditional logic
  const hasUsers = users && users.length > 0
  const isEmpty = !hasUsers

  return (
    <div className="users-page space-y-6">
      <PageHeader title="Users" />
      {hasUsers && <UsersList users={users} />}
      {isEmpty && <EmptyState message="No users found" />}
    </div>
  )
}

export default UsersPage

// Page-level helper component (only used on this page)
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-muted-foreground py-12 text-center">{message}</div>
)
```

---

## Data Fetching with TanStack Query

### API Hooks Pattern (Types + Services + Hooks)

```typescript
// hooks/api/user.ts - Complete API implementation
import { useMutation, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { TMutationOpts, TQueryOpts } from '@/types/api'

// Types - Named consistently with functions
type TGetAllUsersParams = {
  organizationId?: string
  search?: string
  page?: number
}

type TCreateUserPayload = {
  name: string
  email: string
  role: string
}

// Services - Function names match hook names (without 'use' prefix)
const getAllUsers = (params: TGetAllUsersParams): TApiPromise<TUser[]> => {
  return api.get('/users', { params })
}

const createUser = (payload: TCreateUserPayload): TApiPromise<TUser> => {
  return api.post('/users', payload)
}

// Hooks - Cache keys match hook names for consistency
export const useGetAllUsers = (
  params: TGetAllUsersParams,
  options?: TQueryOpts<TUser[]>
) => {
  return useQuery({
    queryKey: ['useGetAllUsers', params], // Cache key matches hook name
    queryFn: () => getAllUsers(params),
    ...options
  })
}

export const useCreateUser = (
  options?: TMutationOpts<TCreateUserPayload, TUser>
) => {
  return useMutation({
    mutationKey: ['useCreateUser'], // Cache key matches hook name
    mutationFn: createUser,
    ...options
  })
}
```

### Error Handling in API Hooks

```tsx
// Component with error handling using API messages
const UsersList = () => {
  const { data: users, isLoading, isError, error } = useGetAllUsers({ page: 1 })

  // Use error message from API response
  if (isError) {
    return <ErrorCard message={error.message} />
  }

  return (
    <div className="space-y-4">
      {users?.map((user) => (
        <UserCard key={user._id} user={user} />
      ))}
    </div>
  )
}
```

---

## State Management Guidelines

### Context Providers

```tsx
// providers/auth-provider.tsx
'use client'

import { createContext, useContext, type ReactNode } from 'react'

type TAuthContext = {
  session: TSession
  signOut: () => Promise<void>
}

const AuthContext = createContext<TAuthContext | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Provider logic
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
```

### Global State Management

- Use React Context for global app state
- Use React Query for server state
- Use local component state for UI state
- Avoid props drilling - use context for deeply nested components

---

## Form Handling Guidelines

### Form Implementation with Zod Schema Validation

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import {
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from '@/components/ui'

type TUserFormProps = {
  onSubmit: ({ data }: { data: TUserFormData }) => void
}

// Main form component at top
export const UserForm = ({ onSubmit }: TUserFormProps) => {
  const form = useForm<TUserFormData>({
    resolver: zodResolver(userSchema)
  })

  const handleSubmit = async ({ data }: { data: TUserFormData }) => {
    try {
      await onSubmit({ data })
      form.reset()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => handleSubmit({ data }))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create User'}
        </Button>
      </form>
    </Form>
  )
}

// Zod schema for validation
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
})

// Type definition
type TUserFormData = z.infer<typeof userSchema>
```

---

## Styling Guidelines

### Tailwind CSS Conventions

1. Use Tailwind utility classes for styling
2. Create custom CSS classes only when necessary
3. **Always use `cn()` function for conditional CSS classes**
4. Follow responsive-first approach
5. Use CSS variables for theme colors
6. Don't bloat pages with unnecessary divs - use advanced CSS if needed

```tsx
// Correct usage with cn() for conditional styling
<div className={cn(
  'flex items-center gap-4 p-4',
  'bg-background border rounded-lg',
  {
    'bg-primary/10 border-primary': isActive,
    'border-destructive': hasError,
  },
  className
)}>
```

```tsx
// Don't use multiple ternaries - assign to variables instead
const cardClasses = cn(
  'card-base',
  isActive && 'active-state',
  hasError && 'error-state'
)
```

### Design System

1. Use Shadcn components as much as possible
2. Use custom components built on top of existing Shadcn components
3. Avoid creating similar-looking new components - extend existing ones instead
4. Use components from @sales-os/ui package
5. Follow consistent spacing and typography scales
6. Use semantic color tokens from the design system

---

## Basic HTML & Testing Guidelines

### Semantic HTML Best Practices

1. **Use proper semantic elements**

   ```tsx
   // Use semantic elements instead of generic divs
   <main>
     <section>
       <h2>Users</h2>
       <ul>
         {users.map((user) => (
           <li key={user._id}>
             <UserCard user={user} />
           </li>
         ))}
       </ul>
     </section>
   </main>
   ```

2. **Proper heading hierarchy**: Use h1, h2, h3 in proper order
3. **Use buttons for actions, links for navigation**
4. **Form elements should have proper labels**
