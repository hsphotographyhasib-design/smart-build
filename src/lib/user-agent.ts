export interface ParsedUserAgent {
  browser: string
  browserVersion: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  operatingSystem: string
  osVersion: string
}

/**
 * User-Agent স্ট্রিং থেকে কাঠামোবদ্ধ ব্রাউজার, ডিভাইস এবং OS তথ্য পার্স করা হচ্ছে।
 *
 * ব্রাউজার সনাক্তকরণের ক্রম গুরুত্বপূর্ণ: মিথ্যা মিল এড়াতে প্রথমে নির্দিষ্ট প্যাটার্ন ব্যবহার করতে হবে
 * (যেমন, "Edg/" কে "Chrome/" এর আগে পরীক্ষা করতে হবে কারণ Edge
 * এর UA স্ট্রিংয়ে "Chrome" অন্তর্ভুক্ত করে)।
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
  // Samsung Browser কে Chrome এর আগে পরীক্ষা করতে হবে (এর UA-তে "Chrome" আছে)
  if (/SamsungBrowser\//i.test(ua)) return 'Samsung Browser'
  // Edge (Chromium-ভিত্তিক) এ "Edg/" আছে
  if (/Edg\//i.test(ua)) return 'Edge'
  // Opera / OPR
  if (/OPR\/|Opera/i.test(ua)) return 'Opera'
  // Firefox
  if (/Firefox\//i.test(ua)) return 'Firefox'
  // Chrome (Edge/Opera/Samsung এর পরে হতে হবে যেগুলোতেও "Chrome" আছে)
  if (/Chrome\//i.test(ua)) return 'Chrome'
  // Safari (Chrome এর পরে হতে হবে যেখানেও "Safari" আছে)
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
  // ট্যাবলেট পরীক্ষা (মোবাইলের আগে কারণ ট্যাবলেটেও "Mobile" থাকতে পারে)
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  // বিনা "Mobile" সহ Android সাধারণত একটি ট্যাবলেট
  if (/Android(?!.*Mobile)/i.test(ua)) return 'tablet'

  // মোবাইল
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
  // Windows সংস্করণ
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

  // macOS সংস্করণ
  const macMatch = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/i)
  if (macMatch) return macMatch[1].replace(/_/g, '.')

  // iOS সংস্করণ
  const iosMatch = ua.match(/OS (\d+[._]\d+[._]?\d*)/i)
  if (iosMatch) return iosMatch[1].replace(/_/g, '.')

  // Android সংস্করণ
  const androidMatch = ua.match(/Android (\d+[\.\d]*)/i)
  if (androidMatch) return androidMatch[1]

  // Linux (UA-তে নির্ভরযোগ্য সংস্করণ নেই)
  const linuxMatch = ua.match(/Linux ([^\s;)]+)/i)
  if (linuxMatch) return linuxMatch[1]

  return ''
}