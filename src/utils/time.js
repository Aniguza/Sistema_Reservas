export const formatTime12 = (time) => {
  if (!time) return '';
  try {
    // If time is like 'HH:MM', build a Date on today
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hh, mm] = time.split(':').map(Number);
      const d = new Date();
      d.setHours(hh, mm, 0, 0);
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Otherwise try parsing as ISO datetime
    const parsed = new Date(time);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Fallback: return original
    return String(time);
  } catch (e) {
    return String(time);
  }
};

export const formatISODateSafe = (iso) => {
  if (!iso || typeof iso !== 'string') return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString('es-ES');
  }
  try {
    return new Date(iso).toLocaleDateString('es-ES');
  } catch (e) {
    return iso;
  }
};

export default {
  formatTime12,
  formatISODateSafe,
};
