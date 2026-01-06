import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { buildUrl } from '../config/api.config.js'

export const Menu = () => {
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
