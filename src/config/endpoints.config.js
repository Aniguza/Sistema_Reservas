export const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
    },
    usuarios: {
        list: '/usuarios',
        perfil: (correo) => `/usuarios/perfil/${encodeURIComponent(correo)}`,
    },
    reservas: {
        base: '/reservas',
        create: '/reservas/create',
        disponibilidad: '/reservas/disponibilidad',
        porUsuario: (correo) => `/reservas/usuario/${encodeURIComponent(correo)}`,
        porId: (id) => `/reservas/${encodeURIComponent(id)}`,
    },
    equipos: {
        list: '/equipos',
        detalle: (id) => `/equipos/${encodeURIComponent(id)}`,
    },
    aulas: {
        list: '/aulas',
    },
};
