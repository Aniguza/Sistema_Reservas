import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { logoutUser } from '../redux/slices/authSlice';
import { useToastActions } from '../Context/ToastContext';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora en milisegundos
const CHECK_INTERVAL = 60 * 1000; // Verificar cada 1 minuto

export const SessionTimeout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { showInfo } = useToastActions();
    const timeoutRef = useRef(null);
    const checkIntervalRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const updateLastActivity = () => {
        const now = Date.now();
        lastActivityRef.current = now;
        localStorage.setItem('lastActivity', now.toString());
    };

    const handleLogout = async () => {
        // Limpiar intervalos
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Mostrar mensaje informativo
        showInfo('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.', 5000);

        // Cerrar sesión
        await dispatch(logoutUser());
        
        // Limpiar localStorage
        localStorage.removeItem('lastActivity');
        
        // Redirigir al login
        navigate('/login');
    };

    const checkInactivity = () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            // No hay sesión activa, limpiar intervalos
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            return;
        }

        const lastActivity = localStorage.getItem('lastActivity');
        const now = Date.now();
        
        if (lastActivity) {
            const timeSinceLastActivity = now - parseInt(lastActivity, 10);
            
            if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
                // Ha pasado 1 hora de inactividad, cerrar sesión
                handleLogout();
            }
        } else {
            // Si no hay timestamp guardado, usar el tiempo actual
            updateLastActivity();
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        
        // Solo monitorear si hay una sesión activa
        if (!token) {
            return;
        }

        // Eventos que indican actividad del usuario
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
            'keydown'
        ];

        const handleActivity = () => {
            updateLastActivity();
            
            // Reiniciar el timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            // Configurar nuevo timeout para cerrar sesión después de 1 hora de inactividad
            timeoutRef.current = setTimeout(() => {
                handleLogout();
            }, INACTIVITY_TIMEOUT);
        };

        // Función para configurar el timeout inicial basado en el tiempo restante
        const setupInitialTimeout = () => {
            const lastActivity = localStorage.getItem('lastActivity');
            const now = Date.now();
            
            if (lastActivity) {
                const timeSinceLastActivity = now - parseInt(lastActivity, 10);
                const timeRemaining = INACTIVITY_TIMEOUT - timeSinceLastActivity;
                
                if (timeRemaining <= 0) {
                    // Ya pasó el tiempo, cerrar sesión inmediatamente
                    handleLogout();
                    return false; // Indicar que la sesión expiró
                } else {
                    // Configurar timeout para el tiempo restante
                    timeoutRef.current = setTimeout(() => {
                        handleLogout();
                    }, timeRemaining);
                }
            } else {
                // No hay timestamp, configurar para 1 hora completa
                updateLastActivity();
                timeoutRef.current = setTimeout(() => {
                    handleLogout();
                }, INACTIVITY_TIMEOUT);
            }
            return true; // Indicar que se configuró correctamente
        };

        // Verificar inmediatamente al montar el componente
        // Si ya pasó 1 hora, cerrará la sesión inmediatamente y no continuará
        const sessionValid = setupInitialTimeout();
        
        if (!sessionValid) {
            // La sesión ya expiró, no configurar listeners ni intervalos
            return;
        }

        // Agregar listeners para eventos de actividad
        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Verificar periódicamente (por si acaso el usuario cambia de pestaña o ventana)
        checkIntervalRef.current = setInterval(checkInactivity, CHECK_INTERVAL);

        // Cleanup
        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [dispatch, navigate, showInfo]);

    // Este componente no renderiza nada
    return null;
};
