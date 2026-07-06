import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, screen } from '@testing-library/react'
import React from 'react'

/**
 * Property 6: Protected Route Redirect
 *
 * For any protected route in the application, when the user is not authenticated,
 * the frontend SHALL redirect to the login page without rendering the protected content.
 *
 * **Validates: Requirements 6.4**
 */

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock useAuth from AuthContext
const mockUseAuth = vi.fn()
vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

import ProtectedRoute from './ProtectedRoute'

// Generator for random content strings (non-empty, printable)
const contentArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)

// Generator for random route paths (simulating various protected routes)
const routePathArb = fc.oneof(
  fc.constant('/'),
  fc.constant('/chat'),
  fc.constant('/conversations'),
  fc.constant('/settings'),
  fc.stringMatching(/^\/[a-z]{1,10}(\/[a-z0-9]{1,8}){0,3}$/)
)

describe('Property 6: Protected Route Redirect', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockUseAuth.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should redirect unauthenticated users to /login and not render children for any content', () => {
    fc.assert(
      fc.property(
        contentArb,
        routePathArb,
        (childContent, _routePath) => {
          mockPush.mockClear()

          // Simulate unauthenticated state (isLoading: false, isAuthenticated: false)
          mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            verify: vi.fn(),
            logout: vi.fn(),
            refreshToken: vi.fn(),
          })

          const { container, unmount } = render(
            <ProtectedRoute>
              <div data-testid="protected-content">{childContent}</div>
            </ProtectedRoute>
          )

          // Property: router.push("/login") must be called
          expect(mockPush).toHaveBeenCalledWith('/login')

          // Property: children content must NOT be rendered
          expect(screen.queryByTestId('protected-content')).toBeNull()
          expect(container.textContent).not.toContain(childContent)

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should render children when user is authenticated for any content', () => {
    fc.assert(
      fc.property(
        contentArb,
        routePathArb,
        (childContent, _routePath) => {
          mockPush.mockClear()

          // Simulate authenticated state
          mockUseAuth.mockReturnValue({
            user: { user_id: 'user-123', email: 'test@example.com' },
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            verify: vi.fn(),
            logout: vi.fn(),
            refreshToken: vi.fn(),
          })

          const { unmount } = render(
            <ProtectedRoute>
              <div data-testid="protected-content">{childContent}</div>
            </ProtectedRoute>
          )

          // Property: children ARE rendered when authenticated
          expect(screen.getByTestId('protected-content')).toBeDefined()
          expect(screen.getByTestId('protected-content').textContent).toBe(childContent)

          // Property: no redirect to login occurs
          expect(mockPush).not.toHaveBeenCalledWith('/login')

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })
})
