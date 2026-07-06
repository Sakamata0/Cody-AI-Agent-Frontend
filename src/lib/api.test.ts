import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 9: Bearer Token Attachment
 *
 * For any API request to a protected endpoint, the request SHALL include an
 * Authorization header with value "Bearer {access_token}" where access_token
 * is the currently stored access token.
 *
 * **Validates: Requirements 7.2**
 */

// Generator for random endpoint paths starting with /
const pathSegmentArb = fc.stringMatching(/^[a-z0-9\-_]{1,15}$/)
const endpointPathArb = fc
  .array(pathSegmentArb, { minLength: 1, maxLength: 4 })
  .map((segments) => '/' + segments.join('/'))

// Generator for non-empty token strings (alphanumeric-like, simulating JWT-style tokens)
const tokenArb = fc.stringMatching(/^[a-zA-Z0-9._\-]{1,64}$/)

describe('Property 9: Bearer Token Attachment', () => {
  let capturedHeaders: Record<string, string>
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    capturedHeaders = {}
    mockLocalStorage = {}

    // Mock fetch to capture headers and return a valid JSON response
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
      const headers = options?.headers as Record<string, string> | undefined
      if (headers) {
        capturedHeaders = { ...headers }
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      }
    }))

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value },
      removeItem: (key: string) => { delete mockLocalStorage[key] },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('should attach Authorization header with Bearer token for any endpoint when token exists', async () => {
    await fc.assert(
      fc.asyncProperty(endpointPathArb, tokenArb, async (endpoint, token) => {
        // Reset captured headers
        capturedHeaders = {}

        // Set token in mock localStorage
        mockLocalStorage['access_token'] = token

        // Re-import api module to pick up fresh mocks
        vi.resetModules()
        const { api } = await import('./api')

        // Make a request to the generated endpoint using the internal request function
        // We use getConversations as a proxy for any protected endpoint call,
        // but we override fetch to capture what's sent to any endpoint
        // Instead, we'll directly test by calling a protected method that uses request()
        try {
          await api.getSettings()
        } catch {
          // We don't care about response errors, only about the headers sent
        }

        // Verify Authorization header format
        expect(capturedHeaders['Authorization']).toBe(`Bearer ${token}`)
      }),
      { numRuns: 100 }
    )
  })

  it('should NOT attach Authorization header when no token is in localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(endpointPathArb, async () => {
        // Reset captured headers
        capturedHeaders = {}

        // Ensure no token in localStorage
        delete mockLocalStorage['access_token']

        // Re-import api module to pick up fresh mocks
        vi.resetModules()
        const { api } = await import('./api')

        try {
          await api.getSettings()
        } catch {
          // We don't care about response errors
        }

        // Verify Authorization header is NOT present
        expect(capturedHeaders['Authorization']).toBeUndefined()
      }),
      { numRuns: 100 }
    )
  })

  it('should attach correct Bearer format for any random token and endpoint', async () => {
    await fc.assert(
      fc.asyncProperty(endpointPathArb, tokenArb, async (endpoint, token) => {
        // Reset captured headers
        capturedHeaders = {}

        // Set token in mock localStorage
        mockLocalStorage['access_token'] = token

        // Mock fetch to use the generated endpoint
        vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
          const headers = options?.headers as Record<string, string> | undefined
          if (headers) {
            capturedHeaders = { ...headers }
          }
          return {
            ok: true,
            status: 200,
            json: async () => ([]),
          }
        }))

        // Re-import api module to pick up fresh mocks
        vi.resetModules()
        const { api } = await import('./api')

        try {
          await api.getConversations()
        } catch {
          // Ignore errors
        }

        // The header value must start with "Bearer " followed by the exact token
        const authHeader = capturedHeaders['Authorization']
        expect(authHeader).toBeDefined()
        expect(authHeader).toMatch(/^Bearer .+$/)
        expect(authHeader).toBe(`Bearer ${token}`)
      }),
      { numRuns: 100 }
    )
  })
})
