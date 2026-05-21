export const API_BASE_URL =
  (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:4001/api';

/** Error de una respuesta HTTP no-OK. Lleva el status para que la UI decida. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Wrapper de fetch tipado y compartido por todos los clients. Centraliza la
 * base URL, el header JSON y el manejo de errores: si la respuesta no es OK,
 * intenta extraer el mensaje del backend y lanza un ApiError.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${String(res.status)}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // el body no es JSON: dejamos el mensaje genérico
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
