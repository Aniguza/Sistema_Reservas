import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEquipos } from '../redux/slices/equiposSlice';
import { fetchAulas } from '../redux/slices/aulasSlice';

/**
 * Componente para cargar datos iniciales una sola vez al inicio de la app
 * Evita que cada página/componente haga sus propias llamadas
 */
export const DataLoader = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        
        // Cargar todos los datos necesarios una sola vez
        dispatch(fetchEquipos());
        dispatch(fetchAulas());
        // fetchUsuarios removido - ahora se usa el endpoint /usuarios/perfil/:correo individual
        
        // console.log('✅ DataLoader: Dispatches enviados');
    }, [dispatch]);

    return null; // No renderiza nada
};
