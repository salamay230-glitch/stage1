export const formatDate = (v) => (v ? new Date(v).toLocaleString() : '—');

export const formatDateOnly = (v) => (v ? new Date(v).toLocaleDateString() : '—');
