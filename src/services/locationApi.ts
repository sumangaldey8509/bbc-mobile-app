import { apiRequest } from './apiClient';

export interface LocationOption {
  id: string;
  name: string;
}

/** GET /api/states — searchable list of states / UTs. */
export function searchStatesRequest(q: string, limit = 40) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  params.set('limit', String(limit));
  return apiRequest<LocationOption[]>(`/states?${params.toString()}`, { method: 'GET' });
}

/** GET /api/states/:stateId/cities — searchable cities for a state. */
export function searchCitiesRequest(stateId: string, q: string, limit = 25) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  params.set('limit', String(limit));
  return apiRequest<LocationOption[]>(`/states/${stateId}/cities?${params.toString()}`, {
    method: 'GET',
  });
}

/** POST /api/states/:stateId/cities — find-or-create a city in that state. */
export function createCityRequest(stateId: string, name: string) {
  return apiRequest<{ id: string; name: string; stateName: string; created: boolean }>(
    `/states/${stateId}/cities`,
    { method: 'POST', body: { name: name.trim() } }
  );
}
