export interface ParsedUserAgent {
  browser: string
  browserVersion: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  operatingSystem: string
  osVersion: string
}

/**
 * Parse a User-Agent string into structured browser, device, and OS info.
 *
 * Browser detection order matters: more specific patterns first to avoid
 * false matches (e.g., "Edg/" must be checked before "Chrome/" since Edge
 * includes "Chrome" in its UA string).
 */
export function parseUserAgent(ua: string): ParsedUserAgent {
  if (!ua) {
    return {
      browser: 'Unknown',
      browserVersion: '',
      deviceType: 'desktop',
      operatingSystem: 'Unknown',
      osVersion: '',
    }
  }

  return {
    browser: detectBrowser(ua),
    browserVersion: extractBrowserVersion(ua),
    deviceType: detectDeviceType(ua),
    operatingSystem: detectOS(ua),
    osVersion: extractOSVersion(ua),
  }
}

function detectBrowser(ua: string): string {
  // Samsung Browser must be checked before Chrome (its UA contains "Chrome")
  if (/SamsungBrowser\//i.test(ua)) return 'Samsung Browser'
  // Edge (Chromium-based) contains "Edg/"
  if (/Edg\//i.test(ua)) return 'Edge'
  // Opera / OPR
  if (/OPR\/|Opera/i.test(ua)) return 'Opera'
  // Firefox
  if (/Firefox\//i.test(ua)) return 'Firefox'
  // Chrome (must be after Edge/Opera/Samsung which also contain "Chrome")
  if (/Chrome\//i.test(ua)) return 'Chrome'
  // Safari (must be after Chrome which also contains "Safari")
  if (/Safari\//i.test(ua)) return 'Safari'

  return 'Unknown'
}

function extractBrowserVersion(ua: string): string {
  const patterns: [RegExp, string][] = [
    [/SamsungBrowser\/(\d+[\.\d]*)/i, 'SamsungBrowser'],
    [/Edg\/(\d+[\.\d]*)/i, 'Edge'],
    [/OPR\/(\d+[\.\d]*)/i, 'Opera'],
    [/Opera\/(\d+[\.\d]*)/i, 'Opera'],
    [/Firefox\/(\d+[\.\d]*)/i, 'Firefox'],
    [/Chrome\/(\d+[\.\d]*)/i, 'Chrome'],
    [/Version\/(\d+[\.\d]*)/i, 'Safari'],
  ]

  for (const [regex] of patterns) {
    const match = ua.match(regex)
    if (match) return match[1]
  }

  return ''
}

function detectDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  // Tablet check (before mobile since tablets may also contain "Mobile")
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  // Android without "Mobile" is typically a tablet
  if (/Android(?!.*Mobile)/i.test(ua)) return 'tablet'

  // Mobile
  if (/Mobile|iPhone|iPod|BlackBerry|IEMobile|Windows Phone/i.test(ua)) {
    return 'mobile'
  }

  return 'desktop'
}

function detectOS(ua: string): string {
  // Windows
  if (/Windows/i.test(ua)) return 'Windows'
  // macOS / Mac OS X
  if (/Mac OS X|macOS/i.test(ua)) return 'macOS'
  // iOS (iPhone OS / iPad)
  if (/iPhone OS|iPad/i.test(ua)) return 'iOS'
  // Android
  if (/Android/i.test(ua)) return 'Android'
  // Linux
  if (/Linux/i.test(ua)) return 'Linux'

  return 'Unknown'
}

function extractOSVersion(ua: string): string {
  // Windows version
  const winMatch = ua.match(/Windows NT (\d+[\.\d]*)/i)
  if (winMatch) {
    const versionMap: Record<string, string> = {
      '10.0': '10/11',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
      '6.0': 'Vista',
      '5.1': 'XP',
    }
    return versionMap[winMatch[1]] || winMatch[1]
  }

  // macOS version
  const macMatch = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/i)
  if (macMatch) return macMatch[1].replace(/_/g, '.')

  // iOS version
  const iosMatch = ua.match(/OS (\d+[._]\d+[._]?\d*)/i)
  if (iosMatch) return iosMatch[1].replace(/_/g, '.')

  // Android version
  const androidMatch = ua.match(/Android (\d+[\.\d]*)/i)
  if (androidMatch) return androidMatch[1]

  // Linux (no reliable version in UA)
  const linuxMatch = ua.match(/Linux ([^\s;)]+)/i)
  if (linuxMatch) return linuxMatch[1]

  return ''
}