import { toast } from 'sonner'
import { useAppStore } from './store'

// ============ ধরন (TYPES) ============

interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  body?: unknown
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  skipAuth?: boolean
  silent?: boolean
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

type ErrorContext = 'network' | 'timeout' | 'server' | 'auth' | 'rate_limit' | 'default'

// ============ ত্রুটি বার্তা ============

const ERROR_MESSAGES: Record<ErrorContext, string> = {
  network: 'Unable to connect. Check your internet connection.',
  timeout: 'Request timed out. Please try again.',
  server: 'Something went wrong on our end. Please try again.',
  auth: 'Session expired. Please log in again.',
  rate_limit: 'Too many requests. Please wait a moment.',
  default: 'An unexpected error occurred.',
}

function classifyError(status: number | undefined, isNetworkError: boolean, isTimeout: boolean): ErrorContext {
  if (isNetworkError) return 'network'
  if (isTimeout) return 'timeout'
  if (status === 401) return 'auth'
  if (status === 429) return 'rate_limit'
  if (status !== undefined && status >= 500) return 'server'
  return 'default'
}

// ============ সহায়ক ফাংশন ============

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAuthHeaders(skipAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (!skipAuth) {
    const { token } = useAppStore.getState()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

// ============ API ক্লায়েন্ট ============

class ApiClient {
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL ?? ''
  }

  async request<T = unknown>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const {
      method,
      url,
      body,
      headers: customHeaders,
      timeout = 30000,
      retries = 3,
      skipAuth = false,
      silent = false,
    } = config

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    const headers = { ...buildAuthHeaders(skipAuth), ...customHeaders }

    let lastError: string | undefined
    let lastContext: ErrorContext = 'default'

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // অনুরোধ করার পূর্বে অফলাইন পরীক্ষা করা হচ্ছে
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          if (!silent) {
            toast.error('You are offline. Please check your internet connection.')
          }
          return {
            success: false,
            error: ERROR_MESSAGES.network,
            message: ERROR_MESSAGES.network,
          }
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(fullUrl, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // প্রতিক্রিয়ার বডি পার্স করা হচ্ছে
        let data: T | undefined
        let responseError: string | undefined
        let responseMessage: string | undefined

        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const parsed = await response.json()
          data = parsed.data ?? parsed
          responseError = parsed.error
          responseMessage = parsed.message
        } else {
          const text = await response.text()
          if (text) {
            try {
              data = JSON.parse(text) as T
            } catch {
              responseMessage = text
            }
          }
        }

        // 401 হ্যান্ডেল করা হচ্ছে — লগইন পৃষ্ঠায় পুনঃনির্দেশিত করা হচ্ছে
        if (response.status === 401) {
          if (!silent) {
            toast.error(ERROR_MESSAGES.auth)
          }
          useAppStore.getState().logout()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return {
            success: false,
            error: ERROR_MESSAGES.auth,
            message: responseMessage ?? ERROR_MESSAGES.auth,
          }
        }

        // 429 হ্যান্ডেল করা হচ্ছে — হার সীমাবদ্ধ
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('retry-after')
          const retryAfterMs = retryAfterHeader
            ? parseInt(retryAfterHeader, 10) * 1000
            : Math.pow(2, attempt) * 1000

          if (attempt < retries) {
            await sleep(retryAfterMs)
            continue
          }

          if (!silent) {
            toast.error(ERROR_MESSAGES.rate_limit)
          }
          return {
            success: false,
            error: ERROR_MESSAGES.rate_limit,
            message: responseMessage ?? ERROR_MESSAGES.rate_limit,
          }
        }

        // 5xx হ্যান্ডেল করা হচ্ছে — সার্ভার ত্রুটি, পুনঃচেষ্টা করা হচ্ছে
        if (response.status >= 500) {
          lastError = ERROR_MESSAGES.server
          lastContext = 'server'

          if (attempt < retries) {
            const backoffMs = Math.pow(2, attempt) * 1000
            await sleep(backoffMs)
            continue
          }

          if (!silent) {
            toast.error(ERROR_MESSAGES.server)
          }
          return {
            success: false,
            error: ERROR_MESSAGES.server,
            message: responseMessage ?? ERROR_MESSAGES.server,
          }
        }

        // 4xx হ্যান্ডেল করা হচ্ছে (401 এবং 429 বাদে) — পুনঃচেষ্টা করা হচ্ছে না
        if (response.status >= 400 && response.status < 500) {
          const context = classifyError(response.status, false, false)
          const message = responseError ?? responseMessage ?? ERROR_MESSAGES[context]

          if (!silent) {
            toast.error(message)
          }
          return {
            success: false,
            error: message,
            message,
          }
        }

        // সফল প্রতিক্রিয়া
        return {
          success: true,
          data,
          message: responseMessage,
        }
      } catch (err: unknown) {
        // এটি টাইমআউট (AbortError) কিনা পরীক্ষা করা হচ্ছে
        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = ERROR_MESSAGES.timeout
          lastContext = 'timeout'

          if (attempt < retries) {
            await sleep(Math.pow(2, attempt) * 1000)
            continue
          }

          if (!silent) {
            toast.error(ERROR_MESSAGES.timeout)
          }
          return {
            success: false,
            error: ERROR_MESSAGES.timeout,
            message: ERROR_MESSAGES.timeout,
          }
        }

        // নেটওয়ার্ক ত্রুটি (fetch সম্পূর্ণভাবে ব্যর্থ হয়েছে)
        lastError = ERROR_MESSAGES.network
        lastContext = 'network'

        // নেটওয়ার্ক ত্রুটিতে পুনঃচেষ্টা করা হচ্ছে
        if (attempt < retries) {
          await sleep(Math.pow(2, attempt) * 1000)
          continue
        }

        if (!silent) {
          toast.error(ERROR_MESSAGES.network)
        }
        return {
          success: false,
          error: ERROR_MESSAGES.network,
          message: ERROR_MESSAGES.network,
        }
      }
    }

    // সকল পুনঃচেষ্টা শেষ হয়ে গেছে
    if (!silent) {
      toast.error(lastError ?? ERROR_MESSAGES.default)
    }
    return {
      success: false,
      error: lastError ?? ERROR_MESSAGES[lastContext] ?? ERROR_MESSAGES.default,
      message: lastError ?? ERROR_MESSAGES[lastContext] ?? ERROR_MESSAGES.default,
    }
  }

  async get<T = unknown>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  async post<T = unknown>(url: string, body?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, body })
  }

  async put<T = unknown>(url: string, body?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, body })
  }

  async delete<T = unknown>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  async patch<T = unknown>(url: string, body?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, body })
  }
}

export const apiClient = new ApiClient()

// Re-export types for consumer convenience
export type { ApiRequestConfig, ApiResponse }