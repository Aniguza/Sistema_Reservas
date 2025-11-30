// Configuración de la API base desde variables de entorno
export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// Configuración de headers por defecto
export const defaultHeaders = {
    'Content-Type': 'application/json',
};

// Helper para construir URLs
export const buildUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
