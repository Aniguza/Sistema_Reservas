import React, { useMemo, useState, useEffect, useCallback } from 'react';
import '../assets/css/calendar.css';

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const ACTIVE_RESERVATION_STATUSES = new Set(['pendiente', 'confirmada', 'reprogramada', 'en_curso']);

const toISODate = (date) => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  return copy.toISOString().split('T')[0];
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const normalizeReservation = (reserva = {}) => {
  const estado = typeof reserva.estado === 'string' ? reserva.estado.toLowerCase() : '';
  return {
    estado: ACTIVE_RESERVATION_STATUSES.has(estado) ? 'occupied' : 'available',
    usuario: reserva.usuario || reserva.nombre || reserva.usuarioNombre,
    correo: reserva.correo || reserva.email || reserva.usuarioCorreo,
    horaInicio: reserva.horaInicio,
    horaFin: reserva.horaFin,
    motivo: reserva.motivo || reserva.descripcion,
    raw: reserva,
  };
};

export const CalendarioDisponibilidad = ({
  reservations: reservationsData = [],
  occupiedRanges = [],
  onDateSelect = () => {},
}) => {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const monthDates = useMemo(() => {
    const baseMonth = startOfMonth(currentMonth);
    return [baseMonth, addMonths(baseMonth, 1)];
  }, [currentMonth]);

  const reservationsMap = useMemo(() => {
    if (!Array.isArray(reservationsData)) return {};
    const acc = reservationsData.reduce((map, reserva) => {
      if (!reserva || !reserva.fecha) return map;
      const iso = toISODate(new Date(reserva.fecha));
      const norm = normalizeReservation(reserva);
      if (!map[iso]) map[iso] = [];
      map[iso].push(norm);
      return map;
    }, {});

    // Map occupiedRanges (from aulas) into per-day occupied entries
    if (Array.isArray(occupiedRanges)) {
      occupiedRanges.forEach((range) => {
        if (!range || !range.start || !range.end) return;
        let start = new Date(range.start);
        const end = new Date(range.end);

        // iterate day-by-day (inclusive)
        while (start <= end) {
          const iso = toISODate(start);
          const norm = {
            estado: 'occupied',
            usuario: null,
            correo: null,
            horaInicio: range.start,
            horaFin: range.end,
            motivo: range.reason || range.motivo || 'Ocupación programada',
            raw: range,
          };
          if (!acc[iso]) acc[iso] = [];
          acc[iso].push(norm);
          start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
        }
      });
    }

    return acc;
  }, [reservationsData, occupiedRanges]);

  const calendarMonths = useMemo(() => {
    return monthDates.map((monthDate) => {
      const reference = startOfMonth(monthDate);
      const startDayOfWeek = (reference.getDay() + 6) % 7;
      const gridStart = new Date(reference);
      gridStart.setDate(gridStart.getDate() - startDayOfWeek);

      const days = [];

      for (let index = 0; index < 42; index += 1) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);

        const iso = toISODate(date);
        const isCurrentMonth = date.getMonth() === reference.getMonth();
        const isPast = iso < todayISO;
        const reservations = reservationsMap[iso];
        const estado = Array.isArray(reservations) && reservations.some((r) => r.estado === 'occupied') ? 'occupied' : 'available';

        days.push({
          iso,
          date,
          isCurrentMonth,
          isPast,
          reservation: reservations,
          estado,
        });
      }

      return {
        key: `${reference.getFullYear()}-${reference.getMonth()}`,
        label: reference.toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric',
        }),
        days,
      };
    });
  }, [monthDates, reservationsMap, todayISO]);

  // Memoizar las reservas para la fecha seleccionada
  const selectedDateReservations = useMemo(() => {
    return selectedDate ? reservationsMap[selectedDate] || null : null;
  }, [selectedDate, reservationsMap]);

  useEffect(() => {
    if (!selectedDate) return;
    onDateSelect(selectedDate, selectedDateReservations);
  }, [selectedDate, selectedDateReservations, onDateSelect]);

  const handleMonthChange = (delta) => {
    setCurrentMonth((prev) => addMonths(prev, delta));
  };

  const handleDaySelect = (day) => {
    setSelectedDate(day.iso);
    if (!day.isCurrentMonth) {
      setCurrentMonth(startOfMonth(day.date));
    }
  };

  const primaryLabel = calendarMonths[0]?.label ?? '';
  const secondaryLabel = calendarMonths[1]?.label ?? '';

  return (
    <div className="untitledui-calendar">
      <div className="calendar-card">
        <header className="calendar-header">
          <button
            type="button"
            className="calendar-nav"
            onClick={() => handleMonthChange(-1)}
            aria-label="Mes anterior"
          >
            <span aria-hidden="true">&#10094;</span>
          </button>
          <div className="calendar-month-label">
            <span className="calendar-month-text">{primaryLabel}</span>
            <span className="calendar-subtitle">{secondaryLabel}</span>
          </div>
          <button
            type="button"
            className="calendar-nav"
            onClick={() => handleMonthChange(1)}
            aria-label="Mes siguiente"
          >
            <span aria-hidden="true">&#10095;</span>
          </button>
        </header>

        <div className="calendar-months">
          {calendarMonths.map((month) => (
            <section key={month.key} className="calendar-month">
              <div className="calendar-month-title">{month.label}</div>
              <div className="calendar-grid">
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={`${month.key}-${label}`}
                    className="calendar-weekday"
                    aria-hidden="true"
                  >
                    {label}
                  </div>
                ))}

                {month.days.map((day) => {
                  const isSelected = day.iso === selectedDate;
                  const hasReservation = Array.isArray(day.reservation) && day.reservation.length > 0;
                  const dayClasses = [
                    'calendar-day',
                    day.isCurrentMonth ? '' : 'calendar-day--muted',
                    isSelected ? 'calendar-day--selected' : '',
                    hasReservation ? 'calendar-day--occupied' : 'calendar-day--available',
                    day.isPast ? 'calendar-day--past' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={day.iso}
                      type="button"
                      className={dayClasses}
                      onClick={() => handleDaySelect(day)}
                      disabled={day.isPast}
                      aria-pressed={isSelected}
                    >
                      <span>{day.date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot legend-dot--available" aria-hidden="true" />
            <span>Disponible</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-dot--occupied" aria-hidden="true" />
            <span>Ocupado</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-dot--selected" aria-hidden="true" />
            <span>Seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
