import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

/**
 * Property 8: Token Storage Round-Trip
 *
 * For any set of tokens (access_token, id_token, refresh_token) received from
 * a successful login response, the Auth_Provider SHALL store them such that
 * subsequent retrieval from localStorage returns the identical token values.
 *
 * **Validates: Requirements 7.1**
 */

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock the api module
vi.mock('./api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    verify: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  },
}))

// Generator for non-empty token strings (alphanumeric + dots/dashes to simulate JWT format)
const tokenArb = fc.stringMatching(/^[a-zA-Z0-9._\-]{1,128}$/)

describe('Property 8: Token Storage Round-Trip', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    mockLocalStorage = {}

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value },
      removeItem: (key: string) => { delete mockLocalStorage[key] },
      clear: () => { mockLocalStorage = {} },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('should store all tokens in localStorage after login such that retrieval returns identical values', async () => {
    await fc.assert(
      fc.asyncProperty(
        tokenArb,
        tokenArb,
        tokenArb,
        async (accessToken, idToken, refreshToken) => {
          // Clear localStorage for each run
          mockLocalStorage = {}

          // Re-import modules with fresh state
          vi.resetModules()

          // Re-mock next/navigation after resetModules
          vi.doMock('next/navigation', () => ({
            useRouter: () => ({
              push: vi.fn(),
              replace: vi.fn(),
              back: vi.fn(),
              forward: vi.fn(),
              refresh: vi.fn(),
              prefetch: vi.fn(),
            }),
          }))

          // Mock api.login to return the generated tokens
          vi.doMock('./api', () => ({
            api: {
              login: vi.fn().mockResolvedValue({
                access_token: accessToken,
                id_token: idToken,
                refresh_token: refreshToken,
                user: { user_id: 'test-user-id', email: 'test@example.com' },
              }),
              register: vi.fn(),
              verify: vi.fn(),
              logout: vi.fn(),
              refresh: vi.fn(),
            },
          }))

          // Import AuthProvider with fresh mocks
          const { AuthProvider, useAuth } = await import('./AuthContext')

          // Create wrapper component
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
          )

          // Render the hook within the AuthProvider
          const { result } = renderHook(() => useAuth(), { wrapper })

          // Call login with any credentials (mocked API will return generated tokens)
          await act(async () => {
            await result.current.login('test@example.com', 'password123')
          })

          // Verify: localStorage should contain the exact token values
          expect(mockLocalStorage['access_token']).toBe(accessToken)
          expect(mockLocalStorage['id_token']).toBe(idToken)
          expect(mockLocalStorage['refresh_token']).toBe(refreshToken)
        }
      ),
      { numRuns: 100 }
    )
  })
})
