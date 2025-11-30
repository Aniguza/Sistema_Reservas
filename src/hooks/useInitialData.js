import { useSelector } from 'react-redux';

/**
 * Hook para acceder a los datos precargados de Redux
 * Los datos se cargan una sola vez por el componente DataLoader en App.jsx
 * Este hook solo lee los datos, no hace dispatches
 */
export const useInitialData = () => {
    const equipos = useSelector(state => state.equipos);
    const aulas = useSelector(state => state.aulas);
    const usuarios = useSelector(state => state.usuarios);

    return {
        equipos: equipos.items,
        aulas: aulas.items,
        usuarios: usuarios.items,
        isLoading: equipos.isLoading || aulas.isLoading || usuarios.isLoading,
        error: equipos.error || aulas.error || usuarios.error,
    };
};
