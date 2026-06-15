import { Prisma } from '@prisma/client'

// Prisma মডেল ইনস্ট্যান্সে গেটার ফাংশন থাকে যা সিরিয়ালাইজ করা যায় না।
// API প্রতিক্রিয়ার জন্য Prisma ফলাফল নিরাপদে সিরিয়ালাইজ করতে এই সহায়ক ব্যবহার করুন।
export function safeJson<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}
