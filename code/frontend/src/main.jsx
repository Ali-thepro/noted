import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'
import ThemeProvider from './components/ThemeProvider'

// if (typeof window !== 'undefined') {
//   if (document.visibilityState === "hidden") {
//     memoryStore.clear();
//   }
// }

// document.addEventListener('beforeunload', () => {
//   if (document.visibilityState === "hidden") {
//     memoryStore.clear();
//   }
// })

createRoot(document.getElementById('root')).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </PersistGate>
)
