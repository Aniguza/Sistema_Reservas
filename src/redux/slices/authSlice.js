import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { buildUrl } from '../../config/api.config';

// Async thunk para login
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password, isAdmin = false }, { rejectWithValue }) => {
        try {
            const response = await fetch(buildUrl('/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email, contraseña: password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Error en el inicio de sesión');
            }

            const data = await response.json();
            // Guardar token y datos del usuario
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk para logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            return true;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk para obtener perfil del usuario
export const fetchUserProfile = createAsyncThunk(
    'auth/fetchProfile',
    async (correo, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(buildUrl(`/usuarios/perfil/${correo}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar el perfil');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('access_token') || null,
        isLoading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem('access_token'),
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.usuario;
                state.token = action.payload.access_token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // Fetch User Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
