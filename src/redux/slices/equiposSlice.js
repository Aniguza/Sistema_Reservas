import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { buildUrl } from '../../config/api.config';

// Async thunk para obtener todos los equipos
export const fetchEquipos = createAsyncThunk(
    'equipos/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(buildUrl('/equipos'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener los equipos');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    },
    {
        condition: (_, { getState }) => {
            const { equipos } = getState();
            // No ejecutar si ya está cargando o ya se cargó
            return !(equipos.isLoading || equipos.loaded);
        },
    }
);

// Async thunk para obtener un equipo por ID
export const fetchEquipoById = createAsyncThunk(
    'equipos/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(buildUrl(`/equipos/${id}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener el equipo');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const equiposSlice = createSlice({
    name: 'equipos',
    initialState: {
        items: [],
        currentEquipo: null,
        isLoading: false,
        error: null,
        loaded: false, // Flag para saber si ya se cargaron los datos
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentEquipo: (state) => {
            state.currentEquipo = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch todos los equipos
            .addCase(fetchEquipos.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEquipos.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
                state.error = null;
                state.loaded = true; // Marcar como cargado
            })
            .addCase(fetchEquipos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch equipo por ID
            .addCase(fetchEquipoById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEquipoById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentEquipo = action.payload;
                state.error = null;
            })
            .addCase(fetchEquipoById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearCurrentEquipo } = equiposSlice.actions;
export default equiposSlice.reducer;
