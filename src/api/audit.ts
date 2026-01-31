export interface AuditQuery {
  startDate?: string;
  endDate?: string;
  level?: string;
  user?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

const AUTH_STORAGE_KEY = 'HRMS_AUTH_SESSION_V1';
const getDemoToken = () => {
  try {
    const s = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!s) return null;
    const u = JSON.parse(s);
    if (u?.email === 'admin@hrms.com' || u?.role === 'admin') return 'admin-token';
    if (u?.role === 'auditor') return 'auditor-token';
    return null;
  } catch (e) { return null; }
};

export const fetchAuditLogs = async (query: AuditQuery) => {
  const params = new URLSearchParams();
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);
  if (query.level) params.set('level', query.level);
  if (query.user) params.set('user', query.user);
  if (query.search) params.set('search', query.search);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit || 50));
  if (query.sort) params.set('sort', query.sort);
  if (query.order) params.set('order', query.order || 'desc');

  const token = getDemoToken();
  const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    credentials: 'include'
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed fetching audit logs');
  }

  return res.json();
};

export const exportAuditLogs = async (filter: AuditQuery, format: 'csv' | 'json' = 'csv') => {
  const token = getDemoToken();
  const res = await fetch('/api/admin/export-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      'x-csrf-token': 'demo-csrf-token',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ filter, format }),
    credentials: 'include'
  });

  if (!res.ok) {
    throw new Error('Export failed');
  }

  const blob = await res.blob();
  return blob;
};
