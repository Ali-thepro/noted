import { describe, test, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '../test-utils'
import ForgotPassword from '../../src/pages/ForgotPassword'
import { requestPasswordReset } from '../../src/services/auth'

// Mock the modules
vi.mock('../../src/services/auth', () => ({
  requestPasswordReset: vi.fn()
}))

describe('ForgotPassword', () => {
  const mockNavigate = vi.fn()
  
  const preloadedState = {
    theme: 'light'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = () => {
    return render(<ForgotPassword />, {
      preloadedState,
      routeConfig: [],
      routerProps: {
        navigate: mockNavigate
      }
    })
  }

  test('renders forgot password form', () => {
    renderWithRouter()

    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    expect(screen.getByText(/remember your password/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  test('successfully sends reset link', async () => {
    const successMessage = 'Password reset link sent to your email'
    requestPasswordReset.mockResolvedValueOnce({ message: successMessage })
    
    renderWithRouter()

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith('test@example.com')
      expect(screen.getByText(successMessage)).toBeInTheDocument()
      expect(emailInput.value).toBe('')
    })
  })

  test('shows error message on request failure', async () => {
    const errorMessage = 'Email not found'
    requestPasswordReset.mockRejectedValueOnce({ 
      response: { 
        data: { error: errorMessage } 
      } 
    })
    
    renderWithRouter()

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(emailInput.value).toBe('test@example.com') // Email input should not be cleared
    })
  })

  test('shows loading state while submitting', async () => {
    requestPasswordReset.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    renderWithRouter()

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    fireEvent.click(submitButton)

    expect(screen.getByText('Sending...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  test('requires valid email format', () => {
    renderWithRouter()

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
  })
}) 