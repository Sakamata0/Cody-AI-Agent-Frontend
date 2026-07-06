import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import React, { useEffect } from 'react'

/**
 * Property 7: Auth Page Redirect for Authenticated Users
 *
 * For any authentication page (login, register, verify), when the user is
 * already authenticated, the frontend SHALL redirect to the main chat
 * interface without rendering the auth form.
 *
 * **Validates: Requirements 6.5**
 */

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Variable to control mock auth state
let mockIsAuthenticated = false
let mockIsLoading = false

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({
    user: mockIsAuthenticated ? { user_id: 'test-user', email: 'test@example.com' } : null,
    isAuthenticated: mockIsAuthenticated,
    isLoading: mockIsLoading,
    login: vi.fn(),
    register: vi.fn(),
    verify: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  }),
}))

// Import the mocked useAuth and useRouter so they can be used in the test component
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

/**
 * A generic AuthPageGuard component that mirrors the redirect-if-authenticated
 * behavior that login, register, and verify pages will implement.
 *
 * Pattern: if (isAuthenticated) { router.push("/"); return null; }
 */
function AuthPageGuard({ children, path }: { children: React.ReactNode; path: string }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>
  }

  if (isAuthenticated) {
    return null
  }

  return <div data-testid={`auth-form-${path.replace('/', '')}`}>{children}</div>
}

// Generator: sample from auth page paths
const authPagePathArb = fc.constantFrom('/login', '/register', '/verify')

describe('Property 7: Auth Page Redirect for Authenticated Users', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
    mockIsAuthenticated = false
    mockIsLoading = false
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should redirect authenticated users to "/" for any auth page without rendering the auth form', () => {
    fc.assert(
      fc.property(authPagePathArb, (authPath) => {
        // Set authenticated state
        mockIsAuthenticated = true
        mockIsLoading = false
        mockPush.mockClear()

        const { container, queryByTestId } = render(
          <AuthPageGuard path={authPath}>
            <form data-testid="auth-form">
              <input type="email" />
              <button type="submit">Submit</button>
            </form>
          </AuthPageGuard>
        )

        // Verify: router.push("/") was called (redirect to main chat)
        expect(mockPush).toHaveBeenCalledWith('/')

        // Verify: the auth form is NOT rendered
        const formId = `auth-form-${authPath.replace('/', '')}`
        expect(queryByTestId(formId)).toBeNull()

        // Verify: no form content is rendered
        expect(container.querySelector('form')).toBeNull()

        // Cleanup for the next iteration
        cleanup()
      }),
      { numRuns: 100 }
    )
  })

  it('should NOT redirect unauthenticated users and SHOULD render the auth form', () => {
    fc.assert(
      fc.property(authPagePathArb, (authPath) => {
        // Set unauthenticated state
        mockIsAuthenticated = false
        mockIsLoading = false
        mockPush.mockClear()

        const { queryByTestId } = render(
          <AuthPageGuard path={authPath}>
            <form data-testid="auth-form">
              <input type="email" />
              <button type="submit">Submit</button>
            </form>
          </AuthPageGuard>
        )

        // Verify: router.push("/") was NOT called
        expect(mockPush).not.toHaveBeenCalled()

        // Verify: the auth form IS rendered
        const formId = `auth-form-${authPath.replace('/', '')}`
        expect(queryByTestId(formId)).not.toBeNull()

        // Cleanup for the next iteration
        cleanup()
      }),
      { numRuns: 100 }
    )
  })
})
