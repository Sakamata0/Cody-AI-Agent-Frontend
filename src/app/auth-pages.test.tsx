import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

/**
 * Unit tests for auth pages (LoginPage, RegisterPage, VerifyPage)
 *
 * - Test LoginPage renders email, password, submit button
 * - Test RegisterPage renders email, password, confirm password, submit button
 * - Test VerifyPage renders code input
 * - Test error messages displayed inline on validation failure
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.6, 6.7**
 */

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams('email=test@example.com')
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}))

// Mock useAuth from AuthContext
const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockVerify = vi.fn()
const mockLogout = vi.fn()
const mockRefreshToken = vi.fn()

const mockUseAuth = vi.fn()
vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

import LoginPage from './login/page'
import RegisterPage from './register/page'
import VerifyPage from './verify/page'

describe('LoginPage', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockLogin.mockClear()
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: mockRegister,
      verify: mockVerify,
      logout: mockLogout,
      refreshToken: mockRefreshToken,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders email input, password input, and submit button', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(screen.getByLabelText(/password/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined()
  })

  it('renders email input with correct type', () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('renders password input with correct type', () => {
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows error message when submitting empty fields', async () => {
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByRole('alert').textContent).toContain('Please enter both email and password')
    })
  })

  it('shows error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid email or password'))

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByRole('alert').textContent).toContain('Invalid email or password')
    })
  })

  it('calls login with correct credentials on submit', async () => {
    mockLogin.mockResolvedValue(undefined)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'Password1!')
    })
  })
})

describe('RegisterPage', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockRegister.mockClear()
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: mockRegister,
      verify: mockVerify,
      logout: mockLogout,
      refreshToken: mockRefreshToken,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders email input, password input, confirm password input, and submit button', () => {
    render(<RegisterPage />)

    expect(screen.getByLabelText(/^email$/i)).toBeDefined()
    expect(screen.getByLabelText(/^password$/i)).toBeDefined()
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /create account/i })).toBeDefined()
  })

  it('renders email input with correct type', () => {
    render(<RegisterPage />)

    const emailInput = screen.getByLabelText(/^email$/i)
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('renders password inputs with correct type', () => {
    render(<RegisterPage />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmInput).toHaveAttribute('type', 'password')
  })

  it('shows error when passwords do not match', async () => {
    render(<RegisterPage />)

    const emailInput = screen.getByLabelText(/^email$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } })
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass1!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeDefined()
    })
  })

  it('shows error message on registration failure', async () => {
    mockRegister.mockRejectedValue(new Error('An account with this email already exists'))

    render(<RegisterPage />)

    const emailInput = screen.getByLabelText(/^email$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } })
    fireEvent.change(confirmInput, { target: { value: 'Password1!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/an account with this email already exists/i)).toBeDefined()
    })
  })

  it('calls register with correct credentials when passwords match', async () => {
    mockRegister.mockResolvedValue({ needsVerification: true })

    render(<RegisterPage />)

    const emailInput = screen.getByLabelText(/^email$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } })
    fireEvent.change(confirmInput, { target: { value: 'Password1!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'Password1!')
    })
  })
})

describe('VerifyPage', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockVerify.mockClear()
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: mockRegister,
      verify: mockVerify,
      logout: mockLogout,
      refreshToken: mockRefreshToken,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders code input field', () => {
    render(<VerifyPage />)

    expect(screen.getByLabelText(/verification code/i)).toBeDefined()
  })

  it('renders code input with correct attributes', () => {
    render(<VerifyPage />)

    const codeInput = screen.getByLabelText(/verification code/i)
    expect(codeInput).toHaveAttribute('inputMode', 'numeric')
    expect(codeInput).toHaveAttribute('maxLength', '6')
  })

  it('renders submit button', () => {
    render(<VerifyPage />)

    expect(screen.getByRole('button', { name: /verify email/i })).toBeDefined()
  })

  it('shows error for invalid code (less than 6 digits)', async () => {
    render(<VerifyPage />)

    const codeInput = screen.getByLabelText(/verification code/i)
    const submitButton = screen.getByRole('button', { name: /verify email/i })

    fireEvent.change(codeInput, { target: { value: '123' } })
    // Force form submission by submitting form directly
    const form = codeInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByRole('alert').textContent).toContain('valid 6-digit verification code')
    })
  })

  it('shows error when verification fails', async () => {
    mockVerify.mockRejectedValue(new Error('Verification code is invalid or expired'))

    render(<VerifyPage />)

    const codeInput = screen.getByLabelText(/verification code/i)

    fireEvent.change(codeInput, { target: { value: '999999' } })

    const form = codeInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByRole('alert').textContent).toContain('Verification code is invalid or expired')
    })
  })

  it('calls verify with correct email and code on submit', async () => {
    mockVerify.mockResolvedValue(undefined)

    render(<VerifyPage />)

    const codeInput = screen.getByLabelText(/verification code/i)

    fireEvent.change(codeInput, { target: { value: '123456' } })

    const form = codeInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalledWith('test@example.com', '123456')
    })
  })
})
