import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDispatch } from 'react-redux'
import { googleLogin, githubLogin } from '../src/redux/reducers/authReducer'
import OAuth from '../src/components/OAuth'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}))

vi.mock('../src/redux/reducers/authReducer', () => ({
  googleLogin: vi.fn(),
  githubLogin: vi.fn(),
}))

test('renders Google and GitHub OAuth buttons', () => {
  useDispatch.mockReturnValue(vi.fn())
  render(
    <MemoryRouter>
      <OAuth />
    </MemoryRouter>
  )

  expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument()
})

test('clicking Google button dispatches googleLogin', async () => {
  const mockDispatch = vi.fn()
  useDispatch.mockReturnValue(mockDispatch)

  render(
    <MemoryRouter>
      <OAuth />
    </MemoryRouter>
  )

  const user = userEvent.setup()
  const googleButton = screen.getByText('Sign in with Google')
  await user.click(googleButton)

  expect(googleLogin).toHaveBeenCalledWith(null, null)
  expect(mockDispatch).toHaveBeenCalledWith(googleLogin(null, null))
})

test('clicking GitHub button dispatches githubLogin', async () => {
  const mockDispatch = vi.fn()
  useDispatch.mockReturnValue(mockDispatch)

  render(
    <MemoryRouter>
      <OAuth />
    </MemoryRouter>
  )

  const user = userEvent.setup()
  const githubButton = screen.getByText('Sign in with GitHub')
  await user.click(githubButton)

  expect(githubLogin).toHaveBeenCalledWith(null, null)
  expect(mockDispatch).toHaveBeenCalledWith(githubLogin(null, null))
})
