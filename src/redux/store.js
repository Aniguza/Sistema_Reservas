import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import equiposReducer from './slices/equiposSlice';
import reservasReducer from './slices/reservasSlice';
import aulasReducer from './slices/aulasSlice';
import usuariosReducer from './slices/usuariosSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        equipos: equiposReducer,
        reservas: reservasReducer,
        aulas: aulasReducer,
        usuarios: usuariosReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignorar estas rutas en el check de serialización si es necesario
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export default store;
