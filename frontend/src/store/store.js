import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import donationReducer from '../features/donation/donationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    donation: donationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
