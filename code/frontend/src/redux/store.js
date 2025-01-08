import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import notificationReducer from './reducers/notificationReducer'

const rootReducer = combineReducers({
  notification: notificationReducer,
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