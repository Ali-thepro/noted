//TEST CASE verifies that clicking the "About" button correctly navigates to the /about route.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Header from '../src/components/Header'


// Mock component to display current path
const CurrentPath = () => {
  const location = useLocation()
  return <div data-testid="current-path">{location.pathname}</div>
}

describe('About Button Redirection in Header Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test to ensure test isolation
    vi.resetAllMocks()
  })

  it('renders "About" link and navigates to /about when clicked', async () => {
    // 1. Create a mock Redux store (user state irrelevant for this test)
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
            <Route path="/about" element={<CurrentPath />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    // 3. Find the "About" link by its accessible role and name
    const aboutLink = screen.getByRole('link', { name: /about/i })

    // 4. Assert that the "About" link is rendered
    expect(aboutLink).toBeInTheDocument()

    // 5. Assert that the "About" link has the correct 'href' attribute pointing to '/about'
    expect(aboutLink).toHaveAttribute('href', '/about')

    // 6. Simulate clicking the "About" link
    const user = userEvent.setup()
    await user.click(aboutLink)

    // 7. Assert that navigation to '/about' has occurred by checking the current path
    const currentPath = screen.getByTestId('current-path')
    expect(currentPath).toHaveTextContent('/about')
  })
})
