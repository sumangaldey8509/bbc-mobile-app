import { API_BASE_URL } from '../config/env';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Thin fetch wrapper for the curated-table-be API.
 *
 * The backend always responds with an envelope:
 *   { success: boolean, message: string, data?: any, error?: string }
 * On a non-2xx response (or `success: false`) this throws an `ApiError`
 * carrying the backend `message` so screens can surface it directly.
 */

export class ApiError extends Error {
  status: number;
  /** Machine-readable error code from the backend (e.g. "EMAIL_NOT_VERIFIED"). */
  code?: string;
  /** The full parsed error payload, for the odd case that carries extra fields. */
  details?: Record<string, unknown>;

  constructor(message: string, status: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Attach the stored Bearer token (defaults to true). */
  auth?: boolean;
}

const REQUEST_TIMEOUT_MS = 15000;

export async function apiRequest<T = unknown>(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.', 0);
    }
    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
      0
    );
  }
  clearTimeout(timeout);

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // fall through to status-based error below
  }

  if (!response.ok || !payload || payload.success === false) {
    const message =
      payload?.message || `Request failed (${response.status}). Please try again.`;
    throw new ApiError(
      message,
      response.status,
      payload?.code,
      payload ? (payload as unknown as Record<string, unknown>) : undefined
    );
  }

  return payload.data as T;
}

/**
 * multipart/form-data upload over XHR so we can stream upload progress.
 * `onProgress` receives 0–100.
 */
export function uploadWithProgress<T = unknown>(
  path: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const token = await tokenStorage.get();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}${path}`);
    xhr.setRequestHeader('Accept', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 60000;

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      let payload: ApiEnvelope<T> | null = null;
      try {
        payload = JSON.parse(xhr.responseText) as ApiEnvelope<T>;
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300 && payload && payload.success !== false) {
        resolve(payload.data as T);
      } else {
        reject(
          new ApiError(
            payload?.message || `Upload failed (${xhr.status}).`,
            xhr.status,
            payload?.code
          )
        );
      }
    };
    xhr.onerror = () => reject(new ApiError('Could not reach the server for the upload.', 0));
    xhr.ontimeout = () => reject(new ApiError('The upload timed out. Please try again.', 0));

    xhr.send(formData);
  });
}

