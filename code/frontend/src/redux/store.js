import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import notificationReducer from './reducers/notificationReducer'
import themeReducer from './reducers/themeReducer'

const rootReducer = combineReducers({
  notification: notificationReducer,
  theme: themeReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  blacklist: ['notification'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
})

export const persistor = persistStore(store)