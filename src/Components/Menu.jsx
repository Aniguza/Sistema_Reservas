import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { buildUrl } from '../config/api.config.js'
import { HiHome, HiCollection, HiCalendar } from "react-icons/hi";

export const Menu = ({ isMobile = false }) => {
    const location = useLocation();
    
    const handleMenuClick = () => {
        // Cerrar el drawer en móvil
        const drawerCheckbox = document.getElementById('my-drawer-3');
        if (drawerCheckbox) {
            drawerCheckbox.checked = false;
        }
    };

    const [disabledInfo, setDisabledInfo] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchStatus = async () => {
            try {
                const res = await fetch(buildUrl('/api/deshabilitacion'));
                if (!mounted) return;
                if (!res.ok) {
                    setDisabledInfo({ deshabilitado: false });
                    return;
                }
                const data = await res.json();
                setDisabledInfo(data);
            } catch (e) {
                setDisabledInfo({ deshabilitado: false });
            }
        };
        fetchStatus();
        return () => { mounted = false };
    }, []);

    /// Función para formatear fecha sin problemas de zona horaria
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-'
    
    // Extraer la fecha directamente de la cadena ISO para evitar problemas de zona horaria
    if (fechaISO.includes('T')) {
      const [fechaPart] = fechaISO.split('T')
      const [año, mes, dia] = fechaPart.split('-')
      return `${dia}/${mes}/${año}`
    }
    
    // Si no tiene formato ISO, intentar parsear como Date usando UTC
    const fecha = new Date(fechaISO)
    const año = fecha.getUTCFullYear()
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getUTCDate()).padStart(2, '0')
    return `${dia}/${mes}/${año}`
  }

    const formatReason = (info) => {
        if (!info) return '';
        if (!info.deshabilitado) return '';
        if (info.motivo === 'manual') {
            try {
                const d = info.activadoEn ? new Date(info.activadoEn).toLocaleString() : '';
                return `Deshabilitado por el momento`;
            } catch { return 'Deshabilitado manualmente' }
        }
        if (info.motivo === 'programado') {
            const t = info.tiempo || {};
            return `Deshabilitado por ${t.motivo || 'programación'} ${formatearFecha(t.fechaInicio) || ''} - ${formatearFecha(t.fechaFin) || ''}`;
        }
        return 'Deshabilitado';
    };

    const isActive = (path) => location.pathname === path;

    // Menú para móvil con íconos y mejor diseño
    if (isMobile) {
        return (
            <nav className="flex flex-col gap-2 w-full">
                <Link 
                    to="/" 
                    className={`mobile-menu-item group ${isActive('/') ? 'mobile-menu-item-active' : ''}`}
                    onClick={handleMenuClick}
                >
                    <span className={`mobile-menu-icon ${isActive('/') ? 'bg-primario text-white' : 'bg-baseRojo text-primario group-hover:bg-primario group-hover:text-white'}`}>
                        <HiHome className="w-5 h-5" />
                    </span>
                    <span className="mobile-menu-text">Inicio</span>
                </Link>

                <Link 
                    to="/catalogo" 
                    className={`mobile-menu-item group ${isActive('/catalogo') ? 'mobile-menu-item-active' : ''}`}
                    onClick={handleMenuClick}
                >
                    <span className={`mobile-menu-icon ${isActive('/catalogo') ? 'bg-primario text-white' : 'bg-baseRojo text-primario group-hover:bg-primario group-hover:text-white'}`}>
                        <HiCollection className="w-5 h-5" />
                    </span>
                    <span className="mobile-menu-text">Recursos</span>
                </Link>

                {disabledInfo && disabledInfo.deshabilitado ? (
                    <div
                        className="mobile-menu-item opacity-50 cursor-not-allowed"
                        title={formatReason(disabledInfo)}
                    >
                        <span className="mobile-menu-icon bg-gray-200 text-gray-400">
                            <HiCalendar className="w-5 h-5" />
                        </span>
                        <div className="flex flex-col">
                            <span className="mobile-menu-text text-gray-400">Reservar</span>
                            <span className="text-xs text-gray-400">No disponible</span>
                        </div>
                    </div>
                ) : (
                    <Link 
                        to="/reservas" 
                        className={`mobile-menu-item group ${isActive('/reservas') ? 'mobile-menu-item-active' : ''}`}
                        onClick={handleMenuClick}
                    >
                        <span className={`mobile-menu-icon ${isActive('/reservas') ? 'bg-primario text-white' : 'bg-baseRojo text-primario group-hover:bg-primario group-hover:text-white'}`}>
                            <HiCalendar className="w-5 h-5" />
                        </span>
                        <span className="mobile-menu-text">Reservar</span>
                    </Link>
                )}
            </nav>
        );
    }

    // Menú para desktop (sin cambios)
    return (
        <>
            <Link to="/" className="menuItem" onClick={handleMenuClick}>Inicio</Link>
            <Link to="/catalogo" className="menuItem" onClick={handleMenuClick}> Recursos</Link>
            {disabledInfo && disabledInfo.deshabilitado ? (
                <span
                    className="menuItem opacity-60 cursor-not-allowed"
                    title={formatReason(disabledInfo)}
                    onClick={(e) => e.preventDefault()}
                >
                    Reservar
                </span>
            ) : (
                <Link to="/reservas" className="menuItem" onClick={handleMenuClick}>Reservar</Link>
            )}
        </>
    )
}
