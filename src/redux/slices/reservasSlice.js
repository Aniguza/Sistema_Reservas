import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { buildUrl } from '../../config/api.config';
import { API_ENDPOINTS } from '../../config/endpoints.config';

// Async thunk para crear una reserva
export const createReserva = createAsyncThunk(
    'reservas/create',
    async (reservaData, { rejectWithValue }) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.create), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservaData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Error al crear la reserva');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk para obtener todas las reservas
export const fetchReservas = createAsyncThunk(
    'reservas/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.base), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener las reservas');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk para obtener reservas por usuario (por correo)
export const fetchReservasByUser = createAsyncThunk(
    'reservas/fetchByUser',
    async (correo, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.porUsuario(correo)), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener las reservas del usuario');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk para actualizar una reserva
export const updateReserva = createAsyncThunk(
    'reservas/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.porId(id)), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Error al actualizar la reserva');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk para eliminar una reserva
export const deleteReserva = createAsyncThunk(
    'reservas/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(buildUrl(API_ENDPOINTS.reservas.porId(id)), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la reserva');
            }

            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const reservasSlice = createSlice({
    name: 'reservas',
    initialState: {
        items: [],
        userReservas: [],
        currentReserva: null,
        isLoading: false,
        error: null,
        success: false,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        setCurrentReserva: (state, action) => {
            state.currentReserva = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Crear reserva
            .addCase(createReserva.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createReserva.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items.push(action.payload);
                state.success = true;
                state.error = null;
            })
            .addCase(createReserva.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.success = false;
            })
            // Fetch todas las reservas
            .addCase(fetchReservas.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReservas.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchReservas.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch reservas por usuario
            .addCase(fetchReservasByUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReservasByUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userReservas = action.payload;
                state.error = null;
            })
            .addCase(fetchReservasByUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Actualizar reserva
            .addCase(updateReserva.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateReserva.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateReserva.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Eliminar reserva
            .addCase(deleteReserva.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteReserva.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = state.items.filter(item => item.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteReserva.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearSuccess, setCurrentReserva } = reservasSlice.actions;
export default reservasSlice.reducer;
