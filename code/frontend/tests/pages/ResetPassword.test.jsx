import { describe, test, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '../test-utils'
import ResetPassword from '../../src/pages/ResetPassword'
import { resetPassword } from '../../src/services/auth'
import { toast } from 'react-toastify'

// Mock the modules
vi.mock('../../src/services/auth', () => ({
  resetPassword: vi.fn()
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn()
  }
}))

describe('ResetPassword', () => {
  const mockNavigate = vi.fn()
  const mockSearchParams = new URLSearchParams()
  mockSearchParams.set('token', 'valid-token')

  const preloadedState = {
    theme: 'light'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (searchParams = mockSearchParams) => {
    return render(<ResetPassword />, {
      preloadedState,
      routeConfig: [],
      path: '/reset-password',
      routerProps: {
        navigate: mockNavigate,
        searchParams
      }
    })
  }

  test('renders reset password form', () => {
    renderWithRouter()

    expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
    expect(screen.getByText(/remember your password/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })



  test('shows error when passwords do not match', async () => {
    renderWithRouter()

    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentPassword123!' } })

    const submitButton = screen.getByRole('button', { name: /reset password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      expect(resetPassword).not.toHaveBeenCalled()
    })
  })

  test('successfully resets password', async () => {
    const successMessage = 'Password reset successful'
    resetPassword.mockResolvedValueOnce({ message: successMessage })

    renderWithRouter()

    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123!' } })

    const submitButton = screen.getByRole('button', { name: /reset password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(successMessage)
    })
  })

  test('shows error message on reset failure', async () => {
    const errorMessage = 'Invalid or expired token'
    resetPassword.mockRejectedValueOnce({
      response: {
        data: { error: errorMessage }
      }
    })

    renderWithRouter()

    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123!' } })

    const submitButton = screen.getByRole('button', { name: /reset password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  test('shows loading state while submitting', async () => {
    resetPassword.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithRouter()

    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123!' } })

    const submitButton = screen.getByRole('button', { name: /reset password/i })
    fireEvent.click(submitButton)

    expect(screen.getByText('Resetting...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
