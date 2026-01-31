export interface AuditQuery {
<<<<<<< HEAD
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
=======
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

import { mockAuditLogs } from '../mockData';

export const fetchAuditLogs = async (q: AuditQuery) => {
    const params = new URLSearchParams();
    if (q.page) params.set('page', String(q.page));
    if (q.limit) params.set('limit', String(q.limit));
    if (q.search) params.set('search', q.search);
    if (q.level) params.set('level', q.level);
    if (q.startDate) params.set('startDate', q.startDate);
    if (q.endDate) params.set('endDate', q.endDate);
    if (q.sort) params.set('sort', q.sort);
    if (q.order) params.set('order', q.order);

    try {
        const res = await fetch(`/api/audit?${params.toString()}`);
        // Parse commonly used response shapes so different backends work without breaking the UI
        const parsed = await res.json().catch(() => null);
        if (parsed) {
            if (Array.isArray(parsed)) return { logs: parsed, total: parsed.length };
            if (parsed.logs && Array.isArray(parsed.logs)) return { logs: parsed.logs, total: parsed.total || parsed.logs.length || 0 };
            if (parsed.data && parsed.data.logs && Array.isArray(parsed.data.logs)) return { logs: parsed.data.logs, total: parsed.data.total || parsed.data.logs.length || 0 };
            if (parsed.items && Array.isArray(parsed.items)) return { logs: parsed.items, total: parsed.count || parsed.items.length || 0 };
            if (parsed.results && Array.isArray(parsed.results)) return { logs: parsed.results, total: parsed.total || parsed.results.length || 0 };
            // Unexpected shape
            console.warn('fetchAuditLogs: unexpected response shape', parsed);
            if (res.ok) return { logs: [], total: 0 };
        } else if (!res.ok) {
            console.warn('fetchAuditLogs: network response not ok, using local mock fallback. status=', res.status);
        }
    } catch (e) {
        console.warn('fetchAuditLogs: request failed, using mock fallback', e);
    }

    // Fallback: return sample mock data for local/dev when backend is not available or response was unexpected
    try {
        const total = mockAuditLogs.length;
        const pageNum = q.page || 1;
        const lim = q.limit || 50;
        const start = (pageNum - 1) * lim;
        const logs = mockAuditLogs.slice(start, start + lim);
        return { logs, total, fromMock: true };
    } catch {
        return { logs: [], total: 0, fromMock: true };
    }
};

export const exportAuditLogs = async (q: { startDate?: string; endDate?: string; level?: string; search?: string }, fmt: 'csv' | 'json') => {
    const params = new URLSearchParams();
    if (q.startDate) params.set('startDate', q.startDate);
    if (q.endDate) params.set('endDate', q.endDate);
    if (q.level) params.set('level', q.level);
    if (q.search) params.set('search', q.search || '');
    // Expect backend to return a blob for export
    try {
        const res = await fetch(`/api/audit/export?${params.toString()}&fmt=${fmt}`);
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        return blob;
    } catch (e) {
        // In dev, create a small blob to allow download
        const content = JSON.stringify({ logs: [], note: 'No backend available' });
        return new Blob([content], { type: fmt === 'csv' ? 'text/csv' : 'application/json' });
    }
};
>>>>>>> origin/vijay
