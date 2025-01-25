import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ThemeProvider from '../components/ThemeProvider'
import notificationReducer from '../redux/reducers/notificationReducer'
import themeReducer from '../redux/reducers/themeReducer'
import authReducer from '../redux/reducers/authReducer'
import noteReducer from '../redux/reducers/noteReducer'
import editorConfigReducer from '../redux/reducers/editorConfigReducer'

export function setupStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      notification: notificationReducer,
      theme: themeReducer,
      auth: authReducer,
      note: noteReducer,
      editorConfig: editorConfigReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

export const createRoutesConfig = (routes = []) => routes.map(route => (
  <Route key={route.path} path={route.path} element={route.element} />
))

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    path = '/',
    routeConfig = [],
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <ThemeProvider>
            <Routes>
              {createRoutesConfig(routeConfig)}
              <Route path={path} element={children} />
            </Routes>
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export * from '@testing-library/react'
export { renderWithProviders as render }