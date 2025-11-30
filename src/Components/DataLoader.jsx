import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEquipos } from '../redux/slices/equiposSlice';
import { fetchAulas } from '../redux/slices/aulasSlice';
import { fetchUsuarios } from '../redux/slices/usuariosSlice';

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
        dispatch(fetchUsuarios());
        
        // console.log('✅ DataLoader: Dispatches enviados');
    }, [dispatch]);

    return null; // No renderiza nada
};
