import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import ThemeProvider from '../src/components/ThemeProvider'
import notificationReducer from '../src/redux/reducers/notificationReducer'
import themeReducer from '../src/redux/reducers/themeReducer'
import authReducer from '../src/redux/reducers/authReducer'
import noteReducer from '../src/redux/reducers/noteReducer'
import editorConfigReducer from '../src/redux/reducers/editorConfigReducer'

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
  const testLocation = {}

  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <ThemeProvider>
            <LocationDisplay location={testLocation} />
            <Routes>
              {createRoutesConfig(routeConfig)}
              <Route path="*" element={children} />
            </Routes>
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    )
  }

  return {
    store,
    location: testLocation,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

function LocationDisplay({ location }) {
  const currentLocation = useLocation()
  location.pathname = currentLocation.pathname
  location.search = currentLocation.search
  location.hash = currentLocation.hash
  return null
}

export * from '@testing-library/react' // eslint-disable-line
export { renderWithProviders as render }
