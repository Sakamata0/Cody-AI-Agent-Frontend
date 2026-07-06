import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import React from 'react'

/**
 * Unit tests for logout flow
 *
 * - Test logout button visible when authenticated
 * - Test logout clears localStorage and redirects to /login
 *
 * **Validates: Requirements 8.1, 8.2, 8.4**
 */

// --- Mock next/navigation ---
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
  usePathname: () => '/',
}))

// --- Mock api module ---
vi.mock('@/lib/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    verify: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn(),
  },
}))

// --- Mock ChatContext for AppShell tests ---
vi.mock('@/lib/ChatContext', () => ({
  useChat: () => ({
    conversations: [],
    activeConversationId: null,
    sidebarOpen: true,
    showSearch: false,
    conversationsLoading: false,
    setSidebarOpen: vi.fn(),
    setShowSearch: vi.fn(),
    startNewChat: vi.fn(),
    loadConversation: vi.fn(),
    deleteConversation: vi.fn(),
    renameConversation: vi.fn(),
  }),
}))

describe('Logout Flow', () => {
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    mockLocalStorage = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value },
      removeItem: (key: string) => { delete mockLocalStorage[key] },
      clear: () => { mockLocalStorage = {} },
    })
    mockPush.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('Logout button visibility', () => {
    it('should display logout button in Sidebar when onLogout prop is provided', async () => {
      const { default: Sidebar } = await import('./Sidebar')
      const onLogout = vi.fn()

      render(
        <Sidebar
          conversations={[]}
          activeId={null}
          isOpen={true}
          onToggle={vi.fn()}
          onNewChat={vi.fn()}
          onSelectConversation={vi.fn()}
          onDeleteConversation={vi.fn()}
          onRenameConversation={vi.fn()}
          onOpenChats={vi.fn()}
          onOpenSearch={vi.fn()}
          onLogout={onLogout}
          currentView="chat"
        />
      )

      const logoutButton = screen.getByLabelText('Logout')
      expect(logoutButton).toBeInTheDocument()
      expect(logoutButton).toBeVisible()
    })

    it('should NOT display logout button when onLogout prop is not provided', async () => {
      const { default: Sidebar } = await import('./Sidebar')

      render(
        <Sidebar
          conversations={[]}
          activeId={null}
          isOpen={true}
          onToggle={vi.fn()}
          onNewChat={vi.fn()}
          onSelectConversation={vi.fn()}
          onDeleteConversation={vi.fn()}
          onRenameConversation={vi.fn()}
          onOpenChats={vi.fn()}
          onOpenSearch={vi.fn()}
          currentView="chat"
        />
      )

      const logoutButton = screen.queryByLabelText('Logout')
      expect(logoutButton).not.toBeInTheDocument()
    })
  })

  describe('Logout button click', () => {
    it('should call onLogout when logout button is clicked', async () => {
      const { default: Sidebar } = await import('./Sidebar')
      const onLogout = vi.fn()

      render(
        <Sidebar
          conversations={[]}
          activeId={null}
          isOpen={true}
          onToggle={vi.fn()}
          onNewChat={vi.fn()}
          onSelectConversation={vi.fn()}
          onDeleteConversation={vi.fn()}
          onRenameConversation={vi.fn()}
          onOpenChats={vi.fn()}
          onOpenSearch={vi.fn()}
          onLogout={onLogout}
          currentView="chat"
        />
      )

      const logoutButton = screen.getByLabelText('Logout')
      await fireEvent.click(logoutButton)

      expect(onLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe('AuthContext logout behavior', () => {
    it('should clear all localStorage tokens after logout', async () => {
      // Pre-populate localStorage with tokens
      mockLocalStorage['access_token'] = 'test-access-token'
      mockLocalStorage['id_token'] = 'test-id-token'
      mockLocalStorage['refresh_token'] = 'test-refresh-token'

      const { AuthProvider, useAuth } = await import('@/lib/AuthContext')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Call logout
      await act(async () => {
        await result.current.logout()
      })

      // Verify all tokens are cleared from localStorage
      expect(mockLocalStorage['access_token']).toBeUndefined()
      expect(mockLocalStorage['id_token']).toBeUndefined()
      expect(mockLocalStorage['refresh_token']).toBeUndefined()
    })

    it('should redirect to /login after logout', async () => {
      // Pre-populate localStorage with tokens
      mockLocalStorage['access_token'] = 'test-access-token'
      mockLocalStorage['id_token'] = 'test-id-token'
      mockLocalStorage['refresh_token'] = 'test-refresh-token'

      const { AuthProvider, useAuth } = await import('@/lib/AuthContext')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Call logout
      await act(async () => {
        await result.current.logout()
      })

      // Verify redirect to /login
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
