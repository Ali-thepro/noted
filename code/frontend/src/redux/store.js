import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import expireReducer from 'redux-persist-expire'
import storage from 'redux-persist/lib/storage'
import notificationReducer from './reducers/notificationReducer'
import themeReducer from './reducers/themeReducer'
import authReducer from './reducers/authReducer'
import noteReducer from './reducers/noteReducer'
import editorConfigReducer from './reducers/editorConfigReducer'
import { setDispatch } from '../services/axiosConfig'
// import { createTransform } from 'redux-persist'

// const AuthTransform = createTransform(
//   (inboundState) => {
//     return inboundState
//   },
//   (outboundState) => {
//     if (outboundState?.tokenExpiry && Date.now() > outboundState.tokenExpiry) {
//       return {
//         user: null,
//         loading: false,
//         tokenExpiry: null
//       }
//     }
//     return outboundState
//   },
//   { whitelist: ['auth'] }
// )

const rootReducer = combineReducers({
  notification: notificationReducer,
  theme: themeReducer,
  auth: authReducer,
  note: noteReducer,
  editorConfig: editorConfigReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  blacklist: ['notification', 'note'],
  transforms: [
    expireReducer('auth', {
      expireSeconds: 15 * 60,
      expiredState: { user: null, loading: false, _timestamp: null },
      autoExpire: true,
      persistedAtKey: '_timestamp'
    })
  ]

  // transforms: [AuthTransform]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
})

setDispatch(store.dispatch)


export const persistor = persistStore(store)
