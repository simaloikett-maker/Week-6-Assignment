export function getRecords(result, label) {
  if (Array.isArray(result)) return result;
  for (const key of ['data', 'borrowRequests', 'bookings']) {
    if (Array.isArray(result?.[key])) return result[key];
  }
  throw new Error(`The ${label} response is in an unexpected format.`);
}

export function getDisplayName(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '—';
  return value.username || value.name || value.email || value._id || '—';
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}
