import { apiRequest } from './apiClient';

export interface IndustryOption {
  id: string;
  name: string;
}

/** GET /api/industries — autocomplete search (empty query returns popular ones). */
export function searchIndustriesRequest(q: string, limit = 20) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  params.set('limit', String(limit));
  return apiRequest<IndustryOption[]>(`/industries?${params.toString()}`, { method: 'GET' });
}

/** POST /api/industries — find-or-create; returns the canonical entry. */
export function createIndustryRequest(name: string) {
  return apiRequest<{ id: string; name: string; created: boolean }>('/industries', {
    method: 'POST',
    body: { name: name.trim() },
  });
}
