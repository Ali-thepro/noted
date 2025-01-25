//TEST CASE verifies that clicking the "sign in" button correctly navigates to the /sign in route.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Header from '../src/components/Header'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock component to display current path
const CurrentPath = () => {
  const location = useLocation()
  return <div data-testid="current-path">{location.pathname}</div>
}

describe('Header Component', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation
    vi.resetAllMocks()
  })

  it('Sign In button exists and navigates to /signin when clicked', async () => {
    // 1. Create a mock Redux store with no user (user is not signed in)
    const store = configureStore({
      reducer: {
        theme: () => 'light',
        auth: () => ({ user: null }),
        note: () => ({ viewMode: 'edit' }),
        notification: () => ({}),
        editorConfig: () => ({}),
      },
    })

    // 2. Render the Header component within the necessary providers and routing context
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Header />
          <Routes>
            <Route path="/signin" element={<CurrentPath />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    // 3. Find the "Sign In" button by its accessible role and name
    const signInButton = screen.getByRole('button', { name: /sign in/i })

    // 4. Assert that the Sign In button is in the document
    expect(signInButton).toBeInTheDocument()

    // 5. Find the closest link (<a> tag) that wraps the button
    const linkElement = signInButton.closest('a')

    // 6. Assert that the Link has the correct 'href' attribute pointing to '/signin'
    expect(linkElement).toHaveAttribute('href', '/signin')

    // 7. Simulate clicking the "Sign In" button
    const user = userEvent.setup()
    await user.click(signInButton)

    // 8. Assert that navigation to /signin has occurred by checking the current path
    const currentPath = screen.getByTestId('current-path')
    expect(currentPath).toHaveTextContent('/signin')
  })
})
