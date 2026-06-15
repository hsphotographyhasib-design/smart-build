import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  return NextResponse.json({ message: "Hello, world!" })
}