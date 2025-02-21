import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test-utils'
import ThemeProvider from '../../src/components/ThemeProvider'

describe('ThemeProvider', () => {
  describe('Theme Application', () => {
    it('applies light theme by default', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test Content</div>
        </ThemeProvider>,
        {
          preloadedState: {
            theme: 'light'
          }
        }
      )

      const wrapper = screen.getByTestId('child').parentElement.parentElement
      expect(wrapper).toHaveClass('light')
    })

    it('applies dark theme when selected', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test Content</div>
        </ThemeProvider>,
        {
          preloadedState: {
            theme: 'dark'
          }
        }
      )

      const wrapper = screen.getByTestId('child').parentElement.parentElement
      expect(wrapper).toHaveClass('dark')
    })
  })

  describe('Content Rendering', () => {
    it('renders children correctly', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test Content</div>
        </ThemeProvider>,
        {
          preloadedState: {
            theme: 'light'
          }
        }
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('applies correct background and text colors', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test Content</div>
        </ThemeProvider>,
        {
          preloadedState: {
            theme: 'dark'
          }
        }
      )

      const contentWrapper = screen.getByTestId('child').parentElement
      expect(contentWrapper).toHaveClass('min-h-screen')
      expect(contentWrapper).toHaveClass('w-full')
      expect(contentWrapper).toHaveClass('bg-white')
      expect(contentWrapper).toHaveClass('dark:bg-[rgb(30,33,34)]')
      expect(contentWrapper).toHaveClass('text-gray-700')
      expect(contentWrapper).toHaveClass('dark:text-gray-200')
    })
  })
})
