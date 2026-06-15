/**
 * OpenWA API Client for SmartBuild ERP
 *
 * Wraps the OpenWA REST API (port 2785) for WhatsApp operations.
 * OpenWA uses whatsapp-web.js for direct WhatsApp connection.
 */

const OPENWA_BASE_URL = process.env.OPENWA_URL || 'http://localhost:2785'
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'dev-admin-key'

interface OpenWAConfig {
  baseUrl: string
  apiKey: string
}

let config: OpenWAConfig = {
  baseUrl: OPENWA_BASE_URL,
  apiKey: OPENWA_API_KEY,
}

export function configureOpenWA(opts: Partial<OpenWAConfig>) {
  config = { ...config, ...opts }
}

// Session management
export async function createSession(name: string) {
  return openwaRequest('POST', '/api/sessions', { name })
}

export async function listSessions() {
  return openwaRequest('GET', '/api/sessions')
}

export async function getSession(id: string) {
  return openwaRequest('GET', `/api/sessions/${id}`)
}

export async function startSession(id: string) {
  return openwaRequest('POST', `/api/sessions/${id}/start`)
}

export async function stopSession(id: string) {
  return openwaRequest('POST', `/api/sessions/${id}/stop`)
}

export async function deleteSession(id: string) {
  return openwaRequest('DELETE', `/api/sessions/${id}`)
}

export async function getQRCode(id: string) {
  return openwaRequest('GET', `/api/sessions/${id}/qr`)
}

export async function getSessionStatus(id: string) {
  return openwaRequest('GET', `/api/sessions/${id}/status`)
}

// Messaging
export async function sendTextMessage(sessionId: string, chatId: string, text: string) {
  return openwaRequest('POST', `/api/sessions/${sessionId}/messages/text`, { chatId, text })
}

export async function sendMediaMessage(sessionId: string, chatId: string, type: string, media: { url?: string; base64?: string; mimetype: string }, caption?: string) {
  return openwaRequest('POST', `/api/sessions/${sessionId}/messages/${type}`, {
    chatId,
    [type]: media,
    caption,
  })
}

export async function sendDocument(sessionId: string, chatId: string, document: { url?: string; base64?: string; mimetype: string }, filename: string, caption?: string) {
  return openwaRequest('POST', `/api/sessions/${sessionId}/messages/document`, {
    chatId,
    document,
    filename,
    caption,
  })
}

// Contacts
export async function checkContact(sessionId: string, chatId: string) {
  return openwaRequest('POST', `/api/sessions/${sessionId}/contacts/check`, { chatId })
}

export async function getContactProfile(sessionId: string, chatId: string) {
  return openwaRequest('GET', `/api/sessions/${sessionId}/contacts/${chatId}`)
}

// Groups
export async function listGroups(sessionId: string) {
  return openwaRequest('GET', `/api/sessions/${sessionId}/groups`)
}

export async function getGroupInfo(sessionId: string, groupId: string) {
  return openwaRequest('GET', `/api/sessions/${sessionId}/groups/${groupId}`)
}

// Webhook management
export async function listWebhooks(sessionId?: string) {
  const path = sessionId ? `/api/webhooks?sessionId=${sessionId}` : '/api/webhooks'
  return openwaRequest('GET', path)
}

export async function createWebhook(sessionId: string, url: string, events: string[]) {
  return openwaRequest('POST', '/api/webhooks', { sessionId, url, events })
}

export async function deleteWebhook(id: string) {
  return openwaRequest('DELETE', `/api/webhooks/${id}`)
}

// Utility
export function isOpenWAAvailable(): boolean {
  return !!config.baseUrl && !!config.apiKey
}

// Internal HTTP client
async function openwaRequest(method: string, path: string, body?: unknown): Promise<any> {
  const url = `${config.baseUrl}${path}`
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`OpenWA API Error (${response.status}): ${error.message}`)
    }

    if (response.status === 204) return null
    return response.json()
  } catch (error) {
    if (error instanceof Error && error.message.includes('OpenWA')) throw error
    throw new Error(`Failed to connect to OpenWA service at ${config.baseUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}