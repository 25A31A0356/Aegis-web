/**
 * AGIES ALERT - Frontend API Client
 * Typed service connector linking the frontend to backend API routes with graceful fallback.
 */

import { ApiResponse } from '../../server/types/api';

export class ApiClient {
  private static getBaseUrl(): string {
    if (typeof window === 'undefined') {
      return 'http://localhost:5173/api';
    }
    return '/api';
  }

  private static getAuthHeader(): Record<string, string> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('agies_auth_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  public static async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T | null> {
    try {
      let url = `${this.getBaseUrl()}${endpoint}`;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined) searchParams.append(key, String(val));
        });
        const qs = searchParams.toString();
        if (qs) url += `?${qs}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      if (!res.ok) {
        console.warn(`[ApiClient] GET ${endpoint} responded with status ${res.status}`);
        return null;
      }

      const json: ApiResponse<T> = await res.json();
      return json.success && json.data ? json.data : null;
    } catch (err) {
      console.warn(`[ApiClient] Network request failed for GET ${endpoint}:`, err);
      return null;
    }
  }

  public static async post<T, B = any>(endpoint: string, body: B): Promise<T | null> {
    try {
      const url = `${this.getBaseUrl()}${endpoint}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn(`[ApiClient] POST ${endpoint} responded with status ${res.status}`);
        return null;
      }

      const json: ApiResponse<T> = await res.json();
      return json.success && json.data ? json.data : null;
    } catch (err) {
      console.warn(`[ApiClient] Network request failed for POST ${endpoint}:`, err);
      return null;
    }
  }

  public static async delete<T>(endpoint: string): Promise<T | null> {
    try {
      const url = `${this.getBaseUrl()}${endpoint}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      if (!res.ok) {
        return null;
      }

      const json: ApiResponse<T> = await res.json();
      return json.success && json.data ? json.data : null;
    } catch (err) {
      return null;
    }
  }
}
