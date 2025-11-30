import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { buildUrl } from '../../config/api.config';

// Async thunk para obtener todos los usuarios
export const fetchUsuarios = createAsyncThunk(
    'usuarios/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(buildUrl('/usuarios'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener los usuarios');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    },
    {
        condition: (_, { getState }) => {
            const { usuarios } = getState();
            // No ejecutar si ya está cargando o ya se cargó
            if (usuarios.isLoading || usuarios.loaded) {
                return false;
            }
            return true;
        },
    }
);

const usuariosSlice = createSlice({
    name: 'usuarios',
    initialState: {
        items: [],
        isLoading: false,
        error: null,
        loaded: false, // Flag para saber si ya se cargaron los datos
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsuarios.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsuarios.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
                state.error = null;
                state.loaded = true; // Marcar como cargado
            })
            .addCase(fetchUsuarios.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = usuariosSlice.actions;
export default usuariosSlice.reducer;
