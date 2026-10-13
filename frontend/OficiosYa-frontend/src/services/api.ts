const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

if (!API_URL) {
  throw new Error('Falta configurar VITE_API_URL')
}

export const API_BASE_URL = `${API_URL}/api`

export const ACCESS_TOKEN_KEY = 'oficiosya-access-token'

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(ACCESS_TOKEN_KEY)
      : null

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const responseText = await response.text()

  let responseData: unknown

  if (responseText) {
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }
  }

  if (!response.ok) {
    const errorMessage =
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData &&
      typeof responseData.message === 'string'
        ? responseData.message
        : `Error HTTP: ${response.status} - ${response.statusText}`

    throw new Error(errorMessage)
  }

  return responseData as T
}