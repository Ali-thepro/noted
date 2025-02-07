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
      expect(wrapper.className).toContain('light')
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
      expect(wrapper.className).toContain('dark')
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
      expect(contentWrapper.className).toContain('min-h-screen')
      expect(contentWrapper.className).toContain('w-full')
      expect(contentWrapper.className).toContain('bg-white')
      expect(contentWrapper.className).toContain('dark:bg-[rgb(30,33,34)]')
      expect(contentWrapper.className).toContain('text-gray-700')
      expect(contentWrapper.className).toContain('dark:text-gray-200')
    })
  })
}) 